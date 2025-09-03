import {Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,OneToMany,ManyToOne,UpdateDateColumn,} from "typeorm";


export type OrderStatus = "PENDING" | "PAID"| "SHIPPED" |'CANCELLED';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({default: 'PENDING'})
  status!: OrderStatus;

  @OneToMany(()=> OrderItem,(item) =>item.order)
  items!: OrderItem[];

  @Column()
  total!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @Column()
  quantity!: number;

  @Column()
  unitPrice!: number;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;
}
