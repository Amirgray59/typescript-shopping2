import { SourceData } from "../db.js";
import { Warehouse } from "../entities/warehouse.js";

const wareCreate = {
    schema: {
        body: {
            type:'object',
            properties: {
                name: {type:'string'},
                location: {type:'string'}
            }
        }
    }
}

const wareSingle = {
    schama: {
        params: {
            type:'object',
            properties: {id:{type:'number'}},
            required: ['id']
        }
    }
}

export const warehouseRoute = (server:any, options:any, done:any) => {

    const wareRepo =  SourceData.getRepository(Warehouse);
    
    server.post('/warehouse', wareCreate, async (req:any, res:any) => {
        try{
            
            const {name, location} = req.body;
            const wareHouse = wareRepo.create({name, location});
            const result = await wareRepo.save(wareHouse);
            
            res.send(result)
            
        }
        catch(err:any) {
            res.status(500).send({error:err.message})
        }
    })

    server.get('/warehouse', async (req:any, res:any) => {
        const warehouses = await wareRepo.find();

        res.send(warehouses)
    })

    server.get('/warehouse/:id',wareSingle, async (req:any, res:any) => {
        try {
            const id = req.params.id;
            const ware = await wareRepo.findOneBy({id:id});

            if (!ware) {
                res.status(404).send({error:'Warehouse not found'})
            }
            else  {
                res.send(ware)
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message})
        }
        
    })

    server.delete('/warehouse/:id',wareSingle, async (req:any, res:any) => {
        try {
            const id = req.params.id;
            const ware = await wareRepo.findOneBy({id:id});

            if (!ware) {
                res.status(404).send({error:'Warehouse not found'})
            }
            else  {
                res.removed(ware)
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message})
        }
        
    })


    done()
}