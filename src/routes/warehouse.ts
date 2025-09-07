import { SourceData } from "../db.js";
import { Warehouse } from "../entities/warehouse.js";
import { Type } from "@sinclair/typebox";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const WareCreate = {
    body: Type.Object({
        name: Type.String(),
        location:Type.String()
    })
}

const WareSingle = {
    params: Type.Object({
        id:Type.Number()
    })
}

export const warehouseRoute = (server:FastifyInstance, options:any, done:()=>void) => {

    const wareRepo =  SourceData.getRepository(Warehouse);
    
    server.post('/warehouse', {schema:WareCreate}, async (req:FastifyRequest<{Body:typeof WareCreate.body}>, res:FastifyReply) => {
        const {name, location} = req.body;
        return await SourceData.transaction(async (manager) => {  

            const wareHouse = manager.create(Warehouse, {name, location});
            const result = await manager.save(Warehouse, wareHouse);

            res.send(result)
        })    
    })

    server.get('/warehouse', async (req:FastifyRequest, res:FastifyReply) => {
        return await SourceData.transaction(async (manager) => {  
            const warehouses = await manager.find(Warehouse);

            res.send(warehouses)
        })
    })

    server.get('/warehouse/:id',{schema:WareSingle}, async (req:FastifyRequest<{Params:typeof WareSingle.params}>, res:FastifyReply) => {
    
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {  
            const ware = await manager.findOneBy(Warehouse, {id:id});

            if (!ware) {
                throw Object.assign(new Error('Warehouse not found'), {statusCode:404})
            }
            res.send(ware)
            
        })        
    })

    server.delete('/warehouse/:id',{schema:WareSingle}, async (req:FastifyRequest<{Params:typeof WareSingle.params}>, res:FastifyReply) => {

        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {  

            const ware = await manager.findOneBy(Warehouse, {id:id});

            if (!ware) {
                throw Object.assign(new Error('Warehouse not found'), {statusCode:404})
            }
            await manager.remove(Warehouse, ware)
            res.status(200).send({message:`Warehouse ${id} has been removed!`})
            
        })
        
    })


    done()
}
