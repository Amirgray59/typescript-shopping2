import { User } from "../entities/user.js";
import { SourceData } from "../db.js";
import { Product } from "../entities/product.js";
import { Order, OrderItem } from "../entities/order.js";
import { Inventory } from "../entities/inventory.js";
import { Type } from "@sinclair/typebox";
const OrderItemInput = Type.Object({
    productId: Type.Number(),
    quantity: Type.Number()
});
const OrderAdd = {
    body: Type.Object({
        userId: Type.Number(),
        items: Type.Array(OrderItemInput),
        paymentMethod: Type.Optional(Type.Union([Type.Literal('CARD'), Type.Literal("CASH")]))
    })
};
const OrderSingle = {
    params: Type.Object({
        id: Type.Number()
    })
};
const OrderDelete = {
    params: Type.Object({
        id: Type.Number()
    })
};
const OrderUpdate = {
    params: Type.Object({
        id: Type.Number(),
        status: Type.Union([
            Type.Literal('PENDING'),
            Type.Literal("PAID"),
            Type.Literal("SHIPPED"),
            Type.Literal("CANCELLED")
        ])
    })
};
export const orderRoute = (server, options, done) => {
    server.post('/order', { schema: OrderAdd }, async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const all = req.body;
            console.log(all);
            console.log(all.userId);
            const user = await manager.findOneBy(User, { id: all.userId });
            if (!user) {
                throw Object.assign(new Error('User not found!'), { statusCode: 404 });
            }
            let total = 0;
            const order = manager.create(Order, { userId: all.userId, status: 'PENDING', total: 0, items: all.items });
            const orderItems = [];
            await manager.save(Order, order);
            for (const item of all.items) {
                let prob = await manager.findOneBy(Product, { id: item.productId });
                if (!prob) {
                    throw Object.assign(new Error('Product not found!'), { statusCode: 404 });
                }
                const inventory = await manager.find(Inventory, { where: { productId: item.productId } });
                let neededQty = item.quantity;
                let totalAvail = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
                if (neededQty > totalAvail) {
                    throw Object.assign(new Error('Not enough stock!'), { statusCode: 409 });
                }
                if (inventory.length == 0) {
                    throw Object.assign(new Error('No inventory'), { statusCode: 409 });
                }
                for (const inv of inventory) {
                    if (neededQty == 0) {
                        break;
                    }
                    if (inv.quantity >= neededQty) {
                        inv.quantity -= neededQty;
                        await manager.save(Inventory, inv);
                        neededQty = 0;
                    }
                    else {
                        neededQty -= inv.quantity;
                        inv.quantity = 0;
                        await manager.save(Inventory, inv);
                    }
                }
                let orderItem = manager.create(OrderItem, {
                    productId: prob.id,
                    quantity: item.quantity,
                    unitPrice: prob.price
                });
                await manager.save(OrderItem, orderItem);
                orderItems.push(orderItem);
                total += (prob.price) * item.quantity;
            }
            order.total = total;
            order.items = orderItems;
            await manager.save(Order, order);
            res.status(201).send(order);
        });
    });
    server.get('/order/:id', { schema: OrderSingle }, async (req, res) => {
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {
            const order = await manager.findOne(Order, { where: { id }, relations: ['items'] });
            if (!order) {
                throw Object.assign(new Error('Order not found'), { statusCode: 404 });
            }
            res.status(200).send(order);
        });
    });
    server.get('/order', async (req, res) => {
        const { page = 1, limit = 20, userId, status } = req.query;
        return await SourceData.transaction(async (manager) => {
            const qb = manager.createQueryBuilder(Order, 'o')
                .leftJoinAndSelect('o.items', 'items')
                .leftJoinAndSelect(Product, 'product', 'product.id = items.productId');
            if (status)
                qb.andWhere('o.status = :status', { status });
            if (userId)
                qb.andWhere('o.userId = :userId', { userId });
            const orders = await qb.take(limit).skip((page - 1) * limit).getMany();
            res.send(orders);
        });
    });
    server.delete('/order/:id', { schema: OrderDelete }, async (req, res) => {
        const id = req.params.id;
        const orderRepo = SourceData.getRepository(Order);
        const orderItemRepo = SourceData.getRepository(OrderItem);
        const order = await orderRepo.findOneBy({ id: id });
        if (order && order.status == 'PENDING') {
            await orderRepo.remove(order);
            return res.send({ messerage: "Order has been removed" });
        }
        else {
            throw Object.assign(new Error('Order not found of or status is not PENDING'), { statusCode: 409 });
        }
    });
    server.put('/order/:id/:status', { schema: OrderUpdate }, async (req, res) => {
        const { id, status } = req.params;
        return await SourceData.transaction(async (manager) => {
            const order = await manager.findOne(Order, { where: { id }, relations: ['items'] });
            if (!order) {
                throw Object.assign(new Error('Order not found'), { statusCode: 404 });
            }
            order.status = status;
            await manager.save(Order, order);
            return res.status(200).send(order);
        });
    });
    done();
};
//# sourceMappingURL=order.js.map