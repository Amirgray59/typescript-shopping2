import { Inventory } from "../entities/inventory.js";
import { SourceData } from "../db.js";
import { Product } from "../entities/product.js";
import { Warehouse } from "../entities/warehouse.js";
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
const invAdd = {
    schema: {
        body: {
            type: 'object',
            properties: {
                productId: { type: 'number' },
                warehouseId: { type: 'number' },
                delta: { type: 'number' },
                reason: { type: 'string' }
            }
        },
        response: {
            201: Items,
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};
const inventorySingle = {
    schema: {
        params: {
            type: 'object',
            properties: {
                id: { type: 'number' }
            },
            required: ['id']
        }
    }
};
const inventoryTrans = {
    schema: {
        body: {
            type: 'object',
            properties: {
                productId: { type: 'number' },
                fromWarehouseId: { type: 'number' },
                toWarehouseId: { type: 'number' },
                quantity: { type: 'number' }
            }
        }
    }
};
export const inventoryRoute = (server, options, done) => {
    const invRepo = SourceData.getRepository(Inventory);
    const wareRepo = SourceData.getRepository(Warehouse);
    server.post("/inventory/adjust", invAdd, async (req, res) => {
        const { productId, warehouseId, delta, reason } = req.body;
        try {
            const product = await SourceData.getRepository(Product).findOneBy({ id: productId });
            const warehouse = await wareRepo.findOneBy({ id: warehouseId });
            if (!product || !warehouse) {
                return res.status(404).send({ error: "not found inventory or warehouse" });
            }
            let inv = await invRepo.findOne({ where: { productId, warehouseId } });
            if (!inv) {
                inv = invRepo.create({ productId, warehouseId, quantity: 0, });
            }
            const newQuantity = inv.quantity + delta;
            if (newQuantity < 0) {
                return res.status(409).send({
                    error: "stock error",
                    message: `Stock is negative`,
                });
            }
            inv.quantity = newQuantity;
            const result = await invRepo.save(inv);
            return res.send(result);
        }
        catch (err) {
            return res.status(400).send({ error: "Internet server error", details: err.message });
        }
    });
    server.get("/inventory/:id", inventorySingle, async (req, res) => {
        try {
            const { productId } = req.query;
            if (!productId) {
                const id = req.params.id;
                if (!id) {
                    res.status(404).send({ error: 'Product not found' });
                }
                else {
                    const counts = await invRepo.find({ where: { product: { id: id } }, relations: ['warehouse'] });
                    const total = counts.reduce((sum, inv) => sum + inv.quantity, 0);
                    res.send({ productId: id, totalStock: total, warehouse: counts });
                }
            }
            else {
                const counts = await invRepo.find({
                    where: { product: { id: productId } }, relations: ['warehouse']
                });
                const total = counts.reduce((sum, inv) => sum + inv.quantity, 0);
                res.status(200).send({ productId: productId, totalStock: total, warehouse: counts });
            }
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    server.post("/inventory/transfer", inventoryTrans, async (req, res) => {
        try {
            const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;
            const pid = Number(productId);
            const fromWid = Number(fromWarehouseId);
            const toWid = Number(toWarehouseId);
            const qty = Number(quantity);
            const invRepo = SourceData.getRepository(Inventory);
            const wareRepo = SourceData.getRepository(Warehouse);
            const prodRepo = SourceData.getRepository(Product);
            const product = await prodRepo.findOneBy({ id: pid });
            const fromW = await wareRepo.findOneBy({ id: fromWid });
            const toW = await wareRepo.findOneBy({ id: toWid });
            if (!product || !fromW || !toW) {
                res.status(404).send({ error: 'Not found warehouse or product' });
            }
            let fromInv = await invRepo.findOne({ where: { productId: pid, warehouseId: fromWid } });
            if (!fromInv || fromInv.quantity < qty) {
                return res.status(409).send({ error: 'No stock!' });
            }
            let toInv = await invRepo.findOne({ where: { productId: pid, warehouseId: toWid } });
            if (!toInv) {
                toInv = invRepo.create({ productId: pid, warehouseId: toWid, quantity: 0 });
            }
            fromInv.quantity -= qty;
            toInv.quantity += qty;
            await invRepo.save(fromInv);
            await invRepo.save(toInv);
            return res.send({ message: "Transfer complete" });
        }
        catch (err) {
            res.status(500).send({ error: "Internal server error", details: err.message });
        }
    });
    done();
};
//# sourceMappingURL=inventory.js.map