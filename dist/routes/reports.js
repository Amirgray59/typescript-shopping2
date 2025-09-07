import { Order, OrderItem } from "../entities/order.js";
import { Product } from "../entities/product.js";
import { Inventory } from "../entities/inventory.js";
import { SourceData } from "../db.js";
import { Type } from "@sinclair/typebox";
export const reportRoute = (server, options, done) => {
    const orderRepo = SourceData.getRepository(Order);
    const orderItemRepo = SourceData.getRepository(OrderItem);
    const inventoryRepo = SourceData.getRepository(Inventory);
    server.get("/reports/user-purchases/:userId", async (req, res) => {
        const { userId } = req.params;
        const { from, to } = req.query;
        const qb = orderRepo.createQueryBuilder("o")
            .leftJoinAndSelect("o.items", "item")
            .leftJoinAndSelect("product", "product", "product.id = item.productId")
            .where("o.userId = :userId", { userId });
        if (from)
            qb.andWhere("o.createdAt >= :from", { from: new Date(from) });
        if (to)
            qb.andWhere("o.createdAt <= :to", { to: new Date(to) });
        const orders = await qb.orderBy("o.createdAt", "DESC").getMany();
        res.status(200).send(orders);
    });
    server.get("/reports/top-products", async (req, res) => {
        const { from, to, limit = "10" } = req.query;
        const qb = orderItemRepo.createQueryBuilder("item")
            .leftJoin("item.order", "order")
            .leftJoin(Product, "product", "product.id = item.productId")
            .select("product.id", "productId").addSelect('product.name', 'name')
            .addSelect("SUM(item.quantity)", 'soldNumber')
            .addSelect("SUM(item.quantity * item.unitPrice)", 'profits')
            .groupBy("product.id").limit(parseInt(limit));
        if (from)
            qb.andWhere("order.createdAt >= :from", { from });
        if (to)
            qb.andWhere("order.createdAt <= :to", { to });
        const results = await qb.getRawMany();
        res.status(200).send(results);
    });
    server.get('/reports/low-stock', async (req, res) => {
        const { threshold } = req.query;
        const qb = inventoryRepo.createQueryBuilder('i').leftJoin('i.product', 'product').select('product.id', 'productId')
            .addSelect('product.name', 'name').addSelect('SUM(i.quantity)', 'totalStoch').groupBy('product.id')
            .having('SUM(i.quantity) <= :threshold', { threshold });
        const results = await qb.getRawMany();
        if (results.length == 0) {
            return res.status(409).send({ error: 'Not found' });
        }
        res.status(200).send(results);
    });
    server.get('/reports/sales-by-month', async (req, res) => {
        const { year } = req.query;
        const qb = orderRepo.createQueryBuilder('o').select('MONTH(o.createdAt)', 'month')
            .addSelect('SUM(o.total)', 'profits').where('YEAR(o.createdAt) = :year', { year })
            .groupBy('MONTH(o.createdAt)');
        const results = await qb.getRawMany();
        if (results.length == 0) {
            return res.status(404).send({ error: 'Not found' });
        }
        res.status(200).send(results);
    });
    done();
};
//# sourceMappingURL=reports.js.map