import { Category } from "../entities/category.js";
import { SourceData } from "../db.js";
import { Type } from "@sinclair/typebox";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const CategoryAdd = {
    body: Type.Object({
        name: Type.String(),
        parentId : Type.Number()
    })
}

const CategoryUpdate= {
    params: Type.Object({
        id: Type.Number()
    }),
    body: Type.Object({
        name: Type.String(),
        parentId : Type.Number()
    })
}

const CategoryDelete = {
    params: Type.Object({
        id: Type.Number()
    })
}
    
interface categoryQuery {
    page?:number,
    limit?:number,
    q?:string
}

export const categoryRoute = (server:FastifyInstance, options:any, done:()=>void) => {

    server.post('/category', {schema:CategoryAdd}, async (req:FastifyRequest<{Body:typeof CategoryAdd.body}>, res:FastifyReply) => {
        return await SourceData.transaction(async (manager) => {  

            const {name, parentId} = req.body;
            
            const category = manager.create(Category, {name:name, parentId:parentId});
            const saved = await manager.save(Category, category);

            res.status(201).send(saved)
        
        })
    })

    server.get('/category', async (req:FastifyRequest, res:FastifyReply) => {
        return await SourceData.transaction(async (manager) => {  

            const {page="1", limit="20", q} = req.query as categoryQuery;

            const pageN = Number(page);
            const limitN= Number(limit);

            const fil = manager.createQueryBuilder(Category, 'category')

            if (q) {
                fil.andWhere('category.name LIKE :q', {q:`%${q}%`})
            }
            fil.skip(((pageN as any)-1)*(limitN as any))
            fil.take(limitN)

            const result = await fil.getMany()

            if (result.length > 0) {
                res.status(200).send(result)
            }
            else {
                throw Object.assign(new Error('Category not found'), {statusCode:404})
            }
        })
    })

    server.get("/category/:id",{schema:CategoryDelete}, async (req:FastifyRequest<{Params: typeof CategoryDelete.params}>, res:FastifyReply) => {
        return await SourceData.transaction(async (manager) => {  
        
            const id = req.params.id;

            const category = await manager.findOneBy(Category, {id:id});
            if (!category) {
                throw Object.assign(new Error('Category not found'), {statusCode:404})
            }
            else {
                res.status(200).send(category)
            }
        })

    })

    server.put('/category/:id', {schema:CategoryUpdate}, async (req:FastifyRequest<{Params: typeof CategoryUpdate.params, Body: typeof CategoryUpdate.body}>, res:FastifyReply) => {
        return await SourceData.transaction(async (manager) => {  
        
            const id = req.params.id;

            const category = await manager.findOneBy(Category, {id});
            const {name, parentId} = req.body;

            if (!category) {
                throw Object.assign(new Error('Category not found'))
            }
            else  {
                manager.merge(Category, category, {name, parentId})

                const saved = await manager.save(Category, category)
                res.status(200).send(saved)
            }
        })

    })

    server.delete('/category/:id',{schema:CategoryDelete}, async (req:FastifyRequest<{Params: typeof CategoryDelete.params}>, res:FastifyReply) => {
        return await SourceData.transaction(async (manager) => {  
            const id = req.params.id;
            const category = await manager.findOneBy(Category, {id:id});

            if (!category) {
                throw Object.assign(new Error('Category not found'))
            }
            else {
                await manager.remove(Category, category);
                res.status(200).send({message:'Category has been removed!'})

            }
        })
    })


    done()
}
