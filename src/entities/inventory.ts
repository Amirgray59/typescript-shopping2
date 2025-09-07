import {Entity,PrimaryGeneratedColumn,Column,UpdateDateColumn,ManyToOne,} from "typeorm"
import { Product } from "./product.js"
import {Warehouse} from "./warehouse.js"

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Product, { onDelete: "CASCADE" })
    product!: Product;

    @Column('int')
    productId!:number;

    @ManyToOne(() => Warehouse, { onDelete: "CASCADE" })
    warehouse!: Warehouse;

    @Column('itn')
    warehouseId!:number;

    @Column('int')
    quantity!: number;

    @UpdateDateColumn()
    updatedAt!: Date;
}
