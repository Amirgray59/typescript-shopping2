import Fastify from 'fastify'
import { userRoutes } from './routes/user.js'
import { productRoute } from './routes/product.js'
import { categoryRoute } from './routes/category.js'
import {inventoryRoute} from './routes/inventory.js'
import { warehouseRoute } from './routes/warehouse.js'
import { orderRoute } from './routes/order.js'
import { paymentRoute } from './routes/payment.js'
import { reportRoute } from './routes/reports.js'
import "reflect-metadata";

import Swagger from '@fastify/swagger'
import SwaggerUi from '@fastify/swagger-ui'
import { SourceData } from './db.js'

const server = Fastify({logger:true})
server.register(Swagger)
server.register(SwaggerUi, {routePrefix:'/docs'})

server.register(userRoutes)
server.register(productRoute)
server.register(categoryRoute)
server.register(warehouseRoute)
server.register(inventoryRoute)
server.register(orderRoute)
server.register(paymentRoute)
server.register(reportRoute)

const start = async () => {
  try {
    await SourceData.initialize();
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("server started at port 3000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start()
