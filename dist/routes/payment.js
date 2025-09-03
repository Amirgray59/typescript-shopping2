import { Payment } from "../entities/payment.js";
import { SourceData } from "../db.js";
import { Order } from "../entities/order.js";
const payAdd = {
    schema: {
        body: {
            type: 'object',
            properties: {
                orderId: { type: 'number' },
                amount: { type: 'number' },
                method: { type: 'string', enum: ['CASH', 'CARD'] },
                transactionRef: { type: 'string' }
            }
        }
    }
};
const paySingle = {
    schema: {
        params: {
            type: 'object',
            properties: {
                id: { type: 'number' }
            }
        }
    }
};
export const paymentRoute = (server, options, done) => {
    const payRepo = SourceData.getRepository(Payment);
    const orderRepo = SourceData.getRepository(Order);
    server.post('/payments', payAdd, async (req, res) => {
        try {
            const all = req.body;
            const order = await orderRepo.findOneBy({ id: all.orderId });
            if (!order) {
                return res.status(404).send({ error: "Order not found" });
            }
            if (all.amount > order.total) {
                return res.status(409).send({ error: 'Payment amount is higher then order total!' });
            }
            const statusPay = 'SUCCESS';
            order.status = 'PAID';
            const payment = payRepo.create({ orderId: all.orderId, amount: all.amount, status: statusPay, transactionRef: all.transactionRef });
            await payRepo.save(payment);
            await orderRepo.save(order);
            res.status(201).send(payment);
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    server.get('/payments/:id', paySingle, async (req, res) => {
        try {
            const payment = await payRepo.findOneBy({ id: req.params.id });
            if (!payment) {
                return res.status(404).send({ error: 'Payment nout found' });
            }
            res.status(200).send(payment);
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    server.get('/payments', async (req, res) => {
        try {
            const payments = await payRepo.find();
            res.status(200).send(payments);
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    done();
};
//# sourceMappingURL=payment.js.map