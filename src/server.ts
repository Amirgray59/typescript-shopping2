import dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import { userRoutes } from './routes/user.js'
import { productRoute } from './routes/product.js'
import { categoryRoute } from './routes/category.js'
import {inventoryRoute} from './routes/inventory.js'
import { warehouseRoute } from './routes/warehouse.js'
import { orderRoute } from './routes/order.js'
import { paymentRoute } from './routes/payment.js'
import { reportRoute } from './routes/reports.js'
import { user_authRoute } from './routes/user_auth.js'

import "reflect-metadata";
import fastifyJwt from "@fastify/jwt";

import Swagger from '@fastify/swagger'
import SwaggerUi from '@fastify/swagger-ui'
import { SourceData } from './db.js'


export const server = Fastify({logger:true})

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "super-secret-key",
})


server.setErrorHandler((error, req, reply) => {
  const status = (error as any).statusCode || 500
  reply.code(status).send({error: error.message})
})

server.register(Swagger)
server.register(SwaggerUi, {routePrefix:'/docs'})

server.register(userRoutes)
server.register(user_authRoute)
server.register(productRoute)
server.register(categoryRoute)
server.register(warehouseRoute)
server.register(inventoryRoute)
server.register(orderRoute)
server.register(paymentRoute)
server.register(reportRoute)


const start = ()=> {
    try{
        SourceData.initialize()
        server.listen({
            port: Number(process.env.PORT) || 3000,
            host: process.env.HOST || '0.0.0.0'
        }, (err)=> {
            console.log(err)
        })
        console.log("server started at port: 3000")
    }
    catch (err) {
        server.log.error(err)
    }
}

start()
