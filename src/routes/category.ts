import { Category } from "../entities/category.js";
import { SourceData } from "../db.js";


const categoryAdd = {
    schema: {
        body: {
            type:'object',
            properties: {
                name: {type:'string'},
                parentId: {type:'number'}
            }
        }
    }
} 

const categoryUpdate = {
    schema: {
        params: {
            type:'object',
            properties: {
                id: {type: 'string'}
            },
            required:['id']
        },
        body : {
            type:'object',
            properties: {
                name: {type:'string'},
                parentId: {type:'number'}
            }
        }
    }
}


const categoryDelete = {
    schema: {
    params: {
        type:'object',
        properties: {
            id: {type: 'string'}
        },
        required:['id']
    }
    }}

interface categoryQuery {
    page?:number,
    limit?:number,
    q?:string
}

const categorySingle = {
    schema: {
        params: {
            type:'object',
            properties: {
                id:{type:'number'}
            },
            required:['id']
        }
    }
}

export const categoryRoute = (server:any, options:any, done:any) => {

    const categoryRepo = SourceData.getRepository(Category);

    server.post('/category', categoryAdd, async (req:any, res:any) => {
        try{     
            const {name, parentId} = req.body;
            
            const category = categoryRepo.create({name:name, parentId:parentId});
            const saved = await categoryRepo.save(category);

            res.status(201).send(saved)
        
        }
        catch(err:any) {
            res.status(500).send({error:err.message})
        }
    })

    server.get('/category', async (req:any, res:any) => {
        try {
            const {page="1", limit="20", q} = req.query;

            const pageN = Number(page);
            const limitN= Number(limit);

            const fil = categoryRepo.createQueryBuilder('category')

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
                res.status(404).send({error:'Not found', message:'Category not found'})
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message})
        }
    })

    server.get("/category/:id",categorySingle, async (req:any, res:any) => {
        try{
            const id = req.params.id;

            const category = await categoryRepo.findOneBy({id:id});
            if (!category) {
                res.status(404).send({error:'Not found'})
            }
            else {
                res.status(200).send(category)
            }
        }
        catch(err:any) {
            res.status(500).send({error:err.message})
        }

    })

    server.put('/category/:id', categoryUpdate, async (req:any, res:any) => {
        try {
            const id = req.params.id;

            const category = await categoryRepo.findOneBy({id});
            const updateCat = req.body;

            if (!category) {
                res.status(404).send({error:'Not found'})
            }
            else  {
                categoryRepo.merge(category, updateCat)

                const saved = await categoryRepo.save(category)
                res.status(200).send(saved)
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message})
        }

    })

    server.delete('/category/:id',categoryDelete, async (req:any, res:any) => {
        try {
            const id = req.params.id;
            const category = await categoryRepo.findOneBy({id:id});

            if (!category) {
                res.status(404).send({error:'Not found'})
            }
            else {
                await categoryRepo.remove(category);
                res.status(200).send({message:'Category has been removed!'})

            }
        }
        catch(err:any) {
            res.status(500).send({error:err.message})
        } 
    })


    done()
}
