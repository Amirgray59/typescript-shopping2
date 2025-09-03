import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import {Product} from './product.js'

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name!:string;

    @ManyToOne(() => Category, (category)=> category.children, {nullable:true})
    parentId!:number;

    @OneToMany(() => Category, (category) => category.parentId)
    children?: Category[];

    @OneToMany(() => Product, (product:any) => product.category)
    products?: Product[];

    @CreateDateColumn()
    createdAt!: Date;

    @CreateDateColumn()
    updatedAt!:Date;
}