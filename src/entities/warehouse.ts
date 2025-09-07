import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,OneToMany,} from "typeorm"
import { Inventory } from "./inventory.js"

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;

  @Column('text')
  location!: string;

  @OneToMany(() => Inventory, (inventory) => inventory.warehouse)
  inventories!: Inventory[];
}
