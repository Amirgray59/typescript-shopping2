import { Payment } from "../entities/payment.js";
import { SourceData } from "../db.js";
import { Order } from "../entities/order.js";
import { Type } from "@sinclair/typebox";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const PayAdd = {
    body: Type.Object({
        orderId: Type.Number(),
        amount: Type.Number(),
        method: Type.Union([
            Type.Literal("CASH"),
            Type.Literal("CARD")
        ]),
        transactionRef: Type.String()
    })
}

const PaySingle = {
    params: Type.Object({
        id:Type.Number()
    })
}

interface OrderQuery {
    orderId?:number
}

export const paymentRoute = (server:FastifyInstance, options:any, done:()=>void) => {

    const payRepo = SourceData.getRepository(Payment);
    const orderRepo = SourceData.getRepository(Order);

    server.post('/payments',{schema: PayAdd}, async (req:FastifyRequest<{Body: typeof PayAdd.body}>, res:any) => {

        const all = req.body;
        return await SourceData.transaction(async (manager) => {  

            const order = await manager.findOneBy(Order, {id:all.orderId});

            if (!order) {
                throw Object.assign(new Error('Order not found'), {statusCode:404}) 
            }

            if (all.amount > order.total) {
                throw Object.assign(new Error('Payment amount is higher then order total'))
            }

            const statusPay = 'SUCCESS';
            order.status = 'PAID';

            const payment = manager.create(Payment, {orderId:all.orderId, amount:all.amount,status:statusPay, transactionRef:all.transactionRef})

            await manager.save(Payment, payment);
            await manager.save(Order, order);

            res.status(201).send(payment);
        })

    })

    server.get('/payments/:id', {schema:PaySingle}, async (req:FastifyRequest<{Params:typeof PaySingle.params}>, res:FastifyReply) => {
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {  

            const payment = await manager.findOneBy(Payment, {id:id});

            if (!payment) {
                throw Object.assign(new Error('Payment not found'), {statusCode:404})
            }

            res.status(200).send(payment)
        })
    })

    server.get('/payments', async (req:FastifyRequest, res:FastifyReply) => {
        
        const {orderId} = req.query as OrderQuery;
        return await SourceData.transaction(async (manager) => {  

            if (!orderId) {
                const payments = await manager.find(Payment);
                return res.status(200).send(payments)

            }
            const payment = manager.findOneBy(Payment, {id:orderId});
            res.status(200).send(payment)

        })
    })


    done()
}