import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne } from "typeorm";
import { Order } from "./order.js";

export type Status = "PENDING" | "SUCCESS"| "FAILED";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Order)
    orderId!:Order;

    @Column()
    amount!:number;

    @Column({default:'PENDING'})
    status!:Status;

    @Column()
    transactionRef!:string;
    
    @CreateDateColumn()
    createdAt!:Date;
}