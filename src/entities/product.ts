import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Category } from "./category.js";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!:number;

    @Column({ unique: true })
    sku!: string;

    @Column('varchar')
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column('float')
    price!: number;

    @ManyToOne(() => Category, (category) => category.products)
    category!: Category;

    @CreateDateColumn()
    createdAt!: Date;
}
