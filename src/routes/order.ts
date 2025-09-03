import { User } from "../entities/user.js"
import { SourceData } from "../db.js"
import { Product } from "../entities/product.js"
import { Order, OrderItem } from "../entities/order.js"
import { Inventory } from "../entities/inventory.js"

const orderAdd = {
    schema: {
        body: {
            type:'object',
            properties: {
                userId: {type:'number'},
                items: {
                    type: 'array',
                    minItems:1,
                    items: {
                        type:'object',
                        properties: {
                            productId: {type:'number'},
                            quantity: {type:'number'}
                        },
                    },
                    required: ['productId', 'quantity', 'unitPrice']
                },
                paymentMethod: {
                    type: 'string',
                    enum: ['CARD', 'CASH']
                }
            },
            required: ['userId', 'items']
        }
    }
}

const Items = {
    type:'object',
    properties: {
        id: {type:'number'},
        userId: {type:'number'},
        items: {type:'array'},
        total: {type:'number'},
        createdAt: {type:'string'}
    }
}


const orderSingle = {
    schema: {
        params: {
            type:'object',
            properties: {
                id:{type:'number'}
            }
        },
        response: {
            200: Items
        }
    }
}
const orderDelete = {
    schema: {
        params: {
            type:'object',
            properties: {
                id:{type:'number'}
            }
        }
    }
}

const orderUpdate = {
    schema : {
        params: {
            type:'object',
            properties: {
                id:{type:'number'},
                status: {
                    type:'string',
                    enum : ["PENDING","PAID","SHIPPED",'CANCELLED']
                }
            }
        }
    }
}

interface ProductQuery { 
    userId?:number,
    status?:string, 
    page?:number, 
    limit?:number
}

export const orderRoute = (server:any, options:any, done:any) => {

    const userRepo = SourceData.getRepository(User);
    const productRepo = SourceData.getRepository(Product);
    const orderRepo = SourceData.getRepository(Order);
    const orderItemRepo = SourceData.getRepository(OrderItem);
    const inventoryRepo = SourceData.getRepository(Inventory);


    server.post('/order',orderAdd, async (req:any, res:any) => {
        try {
            const all = req.body;
            const user = await userRepo.findOneBy({id:all.userId});
            if (!user) {
                return res.status(404).send({error:'user not found'})
            }

            let total = 0;
            const order = orderRepo.create({userId:all.userId, status:'PENDING', total:0, items:all.items})
            const orderItems: OrderItem[] = [];

            await orderRepo.save(order)

            for (const item of all.items) {
                let prob = await productRepo.findOneBy({id:item.productId})
                if (!prob) {
                    return res.code(404).send({ error: `prdocuct ${item.productId} not found` });
                }
                
                const inventory = await inventoryRepo.find({where: {productId: item.productId}});
                let neededQty = item.quantity;
                let totalAvail = inventory.reduce((sum, inv) => sum + inv.quantity, 0)

                if (neededQty> totalAvail) {
                    return res.code(409).send({error:'Not enough stock!'})
                }

                if (!inventory) {
                    return res.code(409).send({error: 'No inventory!'})
                }
                for (const inv of inventory) {
                    if (neededQty == 0) {
                        break;
                    }
                    if (inv.quantity>= neededQty) {
                        inv.quantity -= neededQty;
                        await inventoryRepo.save(inv);
                        neededQty = 0
                    }
                    else {
                        neededQty -= inv.quantity;
                        inv.quantity = 0;
                        await inventoryRepo.save(inv);
                    }
                }

                let orderItem = orderItemRepo.create({
                    productId:prob.id,
                    quantity:item.quantity,
                    unitPrice:prob.price
                })

                await orderItemRepo.save(orderItem)
                orderItems.push(orderItem)

                total += (prob.price) * item.quantity

            }

            order.total = total;
            order.items = orderItems;

            await orderRepo.save(order)

            res.status(201).send(order)
            
        }
        catch(err:any) {
            res.status(500).send({error : err.message})
        }

    })

    server.get('/order/:id',orderSingle, async (req:any, res:any) => {
        const id = req.params.id;

        const order = await orderRepo.findOne({where: {id}, relations:['items']});
        if (!order) {
            return res.status(404).send({error:"order id not found"})
        }
        res.status(200).send(order)

    })

    server.get('/order', async (req:any, res:any)=> {
        const orders = await orderRepo.find({relations: ["items"]})
        res.send(orders)
    })

    server.delete('/order/:id', orderDelete, async (req:any, res:any) => {
        try {
            const id = req.params.id;

            const order = await orderRepo.findOneBy({id:id});
            if (order && order.status == 'PENDING') {
                await orderRepo.remove(order)
                return res.send({messerage: "Order has been removed"})
            }   
            else {
                return res.status(409).send({error: 'Order not found or status is not PENDING'})
            }
        }
        catch (err:any) {
            res.status(500).send({error:err.message})
        }
    })

    server.put('/order/:id/:status', orderUpdate, async (req:any, res:any) => {
        try {
            const {id, status} = req.params;

            const order = await orderRepo.findOne({where: {id}, relations:['items']});

            if (!order) {
                return res.status(409).send({error:'Order not found'})
            }
            order.status = status;

            await orderRepo.save(order);
            return res.status(200).send(order)

        }
        catch(err:any) {
            res.status(500).send({error: err.message})
        }
    })
    
    done()
}
