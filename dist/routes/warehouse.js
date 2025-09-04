import { SourceData } from "../db.js";
import { Warehouse } from "../entities/warehouse.js";
const wareCreate = {
    schema: {
        body: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                location: { type: 'string' }
            }
        }
    }
};
const wareSingle = {
    schama: {
        params: {
            type: 'object',
            properties: { id: { type: 'number' } },
            required: ['id']
        }
    }
};
export const warehouseRoute = (server, options, done) => {
    const wareRepo = SourceData.getRepository(Warehouse);
    server.post('/warehouse', wareCreate, async (req, res) => {
        try {
            const { name, location } = req.body;
            const wareHouse = wareRepo.create({ name, location });
            const result = await wareRepo.save(wareHouse);
            res.send(result);
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    server.get('/warehouse', async (req, res) => {
        const warehouses = await wareRepo.find();
        res.send(warehouses);
    });
    server.get('/warehouse/:id', wareSingle, async (req, res) => {
        try {
            const id = req.params.id;
            const ware = await wareRepo.findOneBy({ id: id });
            if (!ware) {
                res.status(404).send({ error: 'Warehouse not found' });
            }
            else {
                res.send(ware);
            }
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    server.delete('/warehouse/:id', wareSingle, async (req, res) => {
        try {
            const id = req.params.id;
            const ware = await wareRepo.findOneBy({ id: id });
            if (!ware) {
                res.status(404).send({ error: 'Warehouse not found' });
            }
            else {
                await wareRepo.remove(ware);
                res.status(200).send({ message: `Warehouse ${id} has been removed!` });
            }
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    done();
};
//# sourceMappingURL=warehouse.js.map