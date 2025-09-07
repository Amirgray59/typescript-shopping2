import { SourceData } from "../db.js";
import { Warehouse } from "../entities/warehouse.js";
import { Type } from "@sinclair/typebox";
const WareCreate = {
    body: Type.Object({
        name: Type.String(),
        location: Type.String()
    })
};
const WareSingle = {
    params: Type.Object({
        id: Type.Number()
    })
};
export const warehouseRoute = (server, options, done) => {
    const wareRepo = SourceData.getRepository(Warehouse);
    server.post('/warehouse', { schema: WareCreate }, async (req, res) => {
        const { name, location } = req.body;
        return await SourceData.transaction(async (manager) => {
            const wareHouse = manager.create(Warehouse, { name, location });
            const result = await manager.save(Warehouse, wareHouse);
            res.send(result);
        });
    });
    server.get('/warehouse', async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const warehouses = await manager.find(Warehouse);
            res.send(warehouses);
        });
    });
    server.get('/warehouse/:id', { schema: WareSingle }, async (req, res) => {
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {
            const ware = await manager.findOneBy(Warehouse, { id: id });
            if (!ware) {
                throw Object.assign(new Error('Warehouse not found'), { statusCode: 404 });
            }
            res.send(ware);
        });
    });
    server.delete('/warehouse/:id', { schema: WareSingle }, async (req, res) => {
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {
            const ware = await manager.findOneBy(Warehouse, { id: id });
            if (!ware) {
                throw Object.assign(new Error('Warehouse not found'), { statusCode: 404 });
            }
            await manager.remove(Warehouse, ware);
            res.status(200).send({ message: `Warehouse ${id} has been removed!` });
        });
    });
    done();
};
//# sourceMappingURL=warehouse.js.map