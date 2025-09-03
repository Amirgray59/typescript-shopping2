import { Product } from "../entities/product.js";
import { SourceData } from "../db.js";
import { UpdateProductDto } from "../dto/product.js";
import { Category } from "../entities/category.js";
import { validateOrReject } from "class-validator";

const Items = {
    type:'object',
    properties: {
        id: {type:'number'},
        sku: {type:'string'},
        name: {type:'string'},
        description: {type:'string'},
        price: {type:'number'},
        createdAt: {type:'string'}
    }
}

const productAdd = {
    schema : {
        body: {
            type:'object',
            properties: {
                sku: {type:'string'},
                name: {type:'string'},
                description: {type:'string'},
                price: {type:'number'},
                categoryId: {type:'number'}
            }
        },
        response: {
            201: Items,
            500: {
                type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }
            }
        }
    }
}

const productShow = {
    schema: {
        response: {
            200: Items,
            404: {type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }},
            500:{
                type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }
            } 
        }
    }
}

const singleProoduct = {
    schema: {
        params: {
            type:'object',
            properties: {
                id: {type:'number'}
            }
        },
        response: {
            200:Items,
            404: {
                type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }
            },
            500: {
                type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }
            } 
        }
    }
}

interface ProductQuery { 
    page?:number,
    limit?:20, 
    q?:string, 
    categoryId?:number, 
    minPrice?:number, 
    maxPrice?:number, 
    sort?:string
}

const productUpdate = {
    schema: {
        params: {
            type:'object',
            properties: {id:{type:'number'}},
            required: ['id']
        },
        body: {
            type:'object',
            properties: {
                sku: {type:'string'},
                name: {type:'string'},
                description: {type:'string'},
                price: {type:'number'},
                categoryId: {type:'number'}
            }
        },
        response: {
            200:Items,
            404: {
                type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }
            },
            500: {
                type:'object',
                properties: {
                    error: {type:'string'},
                    message: {type:'string'}
                }
            }
        }
    }
}

const deleteProduct = {
    schema: {
        params: {
            type:'object',
            properties: {id:{type:'number'}},
            required: ['id']
        },
        response: {
            200:{message:{type:'string'}},
            404: {
                error: {type:'string'},
                message: {type:'string'}
            },
            500: {
                error: {type:'string'},
                message: {type:'string'}    
            }
        }
    }
}

export const productRoute = (server:any, options:any, done:any) => {

    const productRepo = SourceData.getRepository(Product);
    const categoryRepo = SourceData.getRepository(Category);

    server.post('/products', productAdd, async (req:any, res:any) => {
        try {
            const {sku, name, description, price, categoryId} = req.body;

            const category = await categoryRepo.findOneBy({id:categoryId});

            if (!category) {
                res.status(404).send({error: 'Category not found'})
            }
            else {
                const newPro = productRepo.create({sku, name, description, price, category});
                const saved = await productRepo.save(newPro);

                res.status(201).send(saved)
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message, message:'Internet server error'})
        }
        

    })

    server.get('/products/:id', singleProoduct, async (req:any, res:any) => {
        try {
            const id = req.params.id;
            const product = await productRepo.findOne({where: {id:id}});

            if (!product) {
                res.status(404).send({error:'Not found', message: 'Product not found'})
            }
            else {
                res.status(200).send(product)
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message, message:'Internet server error!'})
        }

    })

    server.get('/products', async (req:any, res:any) => {
        try {
            const {page = 1, limit = 20, q, categoryId, minPrice, maxPrice, sort} = req.query as ProductQuery;

            const fil = productRepo.createQueryBuilder("product").leftJoinAndSelect('product.category', 'category')

            if (q) {
                fil.andWhere('product.name LIKE :q OR product.sku LIKE :q', {q:`%${q}%`})
            }
            if (categoryId) {
                fil.andWhere('product.categoryId = :categoryId', {categoryId:categoryId})
            }
            if (minPrice) {
                fil.andWhere('product.price >= :minPrice', {minPrice})
            }
            if (maxPrice) {
                fil.andWhere('product.price <= :maxPrice', {maxPrice})
            }
            if (sort) {
                const [colum, type] = (sort as string).split(':')
                fil.orderBy(`product.${colum}`, (type!.toUpperCase() as "ASC" | "DESC"))
            }
            fil.skip((page - 1) * limit)
            fil.take(limit)

            const results = await fil.getMany()

            if (results.length === 0) {
                res.status(404).send({error:'Not found', message:'Product not found'})
            }
            else {
                res.status(200).send(results)
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message, message:'Internet server error'})
        }
    })

    server.put('/products/:id',productUpdate, async (req:any, res:any) => {
        try {
            const id = req.params.id;
            const updatePro = req.body;

            const category = await categoryRepo.findOneBy({id:updatePro.categoryId});

            if (!category) {
                res.status(404).send({error: 'Not found', message: 'Category not found'})
            }
            else {
                const pro = await productRepo.findOneBy({id});

                if (!pro) {
                    res.status(404).send({error:'Not found', message: 'Product not found'})
                }
                else {
                    productRepo.merge(pro, updatePro)

                    const saved = await productRepo.save(pro)
                    res.status(200).send(saved)
                }
            }


        }
        catch (err:any) {
            res.status(500).send({error:err.message, message:'Internet server error'})
        }
    })
        
    server.delete('/products/:id', deleteProduct, async (req:any, res:any) => {
        try {
            const id = req.params.id;
            const pro = await productRepo.findOneBy({id});

            if (!pro) {
                res.status(404).send({error:'Not found', message:'Product not found'})
            }
            else {
                await productRepo.remove(pro)
                res.status(200).send({message:'Product has been removed!'})
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message, message:'Internet server error'})
        }
    })
    
    done()
}