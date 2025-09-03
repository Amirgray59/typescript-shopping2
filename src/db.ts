import { DataSource, In } from "typeorm";
import { User } from "./entities/user.js";
import { Product } from "./entities/product.js";
import { Category } from "./entities/category.js";
import { Inventory } from "./entities/inventory.js";
import { Warehouse } from "./entities/warehouse.js";
import { Order, OrderItem } from "./entities/order.js";
import { Payment } from "./entities/payment.js";

export const SourceData = new DataSource({
    type:'mariadb',
    host: 'maindb',
    username: 'root',
    password: 'NH1vie3S23R3BvV55VfJFykN',
    database: 'gifted_franklin',
    port:3306,
    synchronize:true,
    entities: [User, Product, Category, Inventory, Warehouse, Order, OrderItem, Payment]
})
