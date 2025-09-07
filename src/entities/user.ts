import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!:number;

    @Column('varchar')
    name!:string;

    @Column('text', {unique:true})
    email!:string;

    @Column('varchar')
    password!:string;

    @Column('int')
    phone!:number;

    @Column('text')
    address!:string;

    @CreateDateColumn()
    createdAt!:Date;
}