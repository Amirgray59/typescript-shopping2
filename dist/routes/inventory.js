import { Inventory } from "../entities/inventory.js";
import { SourceData } from "../db.js";
import { Product } from "../entities/product.js";
import { Warehouse } from "../entities/warehouse.js";
import { Type } from "@sinclair/typebox";
const Items = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        product: { type: 'number' },
        productId: { type: 'number' },
        warehouse: { type: 'number' },
        warehouseId: { type: 'number' },
        quantity: { type: 'number' }
    }
};
const InvAdd = {
    body: Type.Object({
        productId: Type.Number(),
        warehouseId: Type.Number(),
        delta: Type.Number(),
        reason: Type.String()
    })
};
const InvSingle = {
    params: Type.Object({
        id: Type.Number()
    })
};
const InvTrans = {
    body: Type.Object({
        productId: Type.Number(),
        fromWarehouseId: Type.Number(),
        toWarehouseId: Type.Number(),
        quantity: Type.Number()
    })
};
export const inventoryRoute = (server, options, done) => {
    server.post("/inventory/adjust", { schema: InvAdd }, async (req, res) => {
        const { productId, warehouseId, delta, reason } = req.body;
        return await SourceData.transaction(async (manager) => {
            const product = await manager.findOneBy(Product, { id: productId });
            const warehouse = await manager.findOneBy(Warehouse, { id: warehouseId });
            if (!product || !warehouse) {
                throw Object.assign(new Error('Not found inventory or warehouse'), { statusCode: 404 });
            }
            let inv = await manager.findOne(Inventory, { where: { productId, warehouseId } });
            if (!inv) {
                inv = manager.create(Inventory, { productId, warehouseId, quantity: 0, });
            }
            const newQuantity = inv.quantity + delta;
            if (newQuantity < 0) {
                return res.status(409).send({
                    error: "stock error",
                    message: `Stock is negative`,
                });
            }
            inv.quantity = newQuantity;
            const result = await manager.save(Inventory, inv);
            return res.send(result);
        });
    });
    server.get("/inventory/:id", { schema: InvSingle }, async (req, res) => {
        const { productId } = req.query;
        return await SourceData.transaction(async (manager) => {
            if (!productId) {
                const id = req.params.id;
                if (!id) {
                    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
                }
                else {
                    const counts = await manager.find(Inventory, { where: { product: { id: id } }, relations: ['warehouse'] });
                    const total = counts.reduce((sum, inv) => sum + inv.quantity, 0);
                    res.send({ productId: id, totalStock: total, warehouse: counts });
                }
            }
            else {
                const counts = await manager.find(Inventory, {
                    where: { product: { id: productId } }, relations: ['warehouse']
                });
                const total = counts.reduce((sum, inv) => sum + inv.quantity, 0);
                res.status(200).send({ productId: productId, totalStock: total, warehouse: counts });
            }
        });
    });
    server.post("/inventory/transfer", { schema: InvTrans }, async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;
            const pid = Number(productId);
            const fromWid = Number(fromWarehouseId);
            const toWid = Number(toWarehouseId);
            const qty = Number(quantity);
            const product = await manager.findOneBy(Product, { id: pid });
            const fromW = await manager.findOneBy(Warehouse, { id: fromWid });
            const toW = await manager.findOneBy(Warehouse, { id: toWid });
            if (!product || !fromW || !toW) {
                throw Object.assign(new Error('Not found warehouse of product'), { statusCode: 404 });
            }
            let fromInv = await manager.findOne(Inventory, { where: { productId: pid, warehouseId: fromWid } });
            if (!fromInv || fromInv.quantity < qty) {
                throw Object.assign(new Error('No stock'), { statusCode: 409 });
            }
            let toInv = await manager.findOne(Inventory, { where: { productId: pid, warehouseId: toWid } });
            if (!toInv) {
                toInv = manager.create(Inventory, { productId: pid, warehouseId: toWid, quantity: 0 });
            }
            fromInv.quantity -= qty;
            toInv.quantity += qty;
            await manager.save(Inventory, fromInv);
            await manager.save(Inventory, toInv);
            return res.send({ message: "Transfer complete" });
        });
    });
    done();
};
//# sourceMappingURL=inventory.js.map