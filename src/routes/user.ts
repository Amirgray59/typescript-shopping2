import {User} from '../entities/user.js'
import { SourceData } from '../db.js'
import type {FastifyInstance, FastifyRequest, FastifyReply}  from 'fastify'
import { Type } from '@sinclair/typebox'

interface UserQuery {
    name?:string,
    email?:string,
    page?:number,
    limit?:number
}

const Items = Type.Object({
    id: Type.Number(),
    email: Type.String(),
    password:Type.String(),
    name: Type.String(),
    phone:Type.Number(),
    address: Type.String(),
    createdAt:Type.String()
})

const AddUser = {
    body: Type.Object({
        name: Type.String(),
        email:Type.String(),
        password:Type.String(),
        phone:Type.Number(),
        address:Type.String()
    })
}

const SingleUser = {
    params: Type.Object({
        id: Type.Number()
    }),
    response: {
        200: Items
    }
}

const UpdateUser = {
    params: Type.Object({
        id:Type.Number()
    }),
    body: Type.Object({
        name: Type.String(),
        email:Type.String(),
        password:Type.String(),
        phone:Type.Number(),
        address: Type.String()
    }),
    response: {
        200: Items
    }
}

const DeleteUser = {
    params: Type.Object({
        id:Type.Number()
    })
}



export const userRoutes = (server:FastifyInstance, options:any, done:()=>void)=> {
    server.get('/', (req:FastifyRequest,res:FastifyReply)=> {
        res.send('welcome!')
    })

    server.get('/users', async (req:FastifyRequest, res:FastifyReply)=>{
        const {page=1, limit=20, name, email} = req.query as UserQuery;

        return await SourceData.transaction(async (manager) => {

            const query = manager.createQueryBuilder(User, 'user');

            if (name) {
                query.andWhere('user.name LIKE :name', {name: `%${name}%`});
            }
            if (email) {
                query.andWhere('user.email LIKE :email', {email: `%${email}%`});
            }

            query.take(limit)

            const users = await query.getMany()

            if (users.length == 0) {
                throw Object.assign(new Error("User not found!"), {statusCode:404})
            }
            else {
                res.status(200).send(users)
            }
        })

        
    })

    server.post('/users',{schema: AddUser}, async (req:FastifyRequest<{Body:typeof AddUser.body}>, res:FastifyReply)=> {

        const {name, email,password, phone, address} = req.body;

        return await SourceData.transaction(async (manager) => {
            const newUser = manager.create(User, {name, email, password,phone, address});

            const exist = await manager.findOneBy(User, {email:email});

            if (exist) {
                throw Object.assign(new Error('Email already exist'), {statusCode:409})
            }
            const saveUser = await manager.save(User, newUser)

            res.status(201).send(saveUser)
        })
 
    })

    server.get('/users/:id', {schema:SingleUser}, async (req:FastifyRequest<{Params:typeof SingleUser.params}>, res:FastifyReply) => {
        const id = req.params.id 

        return await SourceData.transaction(async (manager) => {
            const user = await manager.findOneBy(User, {id:id})

            if (!user) {
                throw Object.assign(new Error("User not found"), {statusCode:404})
            }
            else {
                res.status(200).send(user)
            }
        })

    })

    server.put('/users/:id', {schema:UpdateUser}, async (req:FastifyRequest<{Params: typeof UpdateUser.params, Body:typeof UpdateUser.body}>, res:FastifyReply) => {
        const id = req.params.id;

        const {name, email, password,phone, address} = req.body;
        const updateData = {name, email, password,phone ,address};

        return await SourceData.transaction(async (manager) => {

            const user = await manager.findOneBy(User, {id})

            if(!user) {
                throw Object.assign(new Error('User not found'), {statusCode:404})
            }
            else {
                await manager.merge(User, user,updateData)

                const saved = await manager.save(User, user);
                res.status(200).send(saved)
            }
    })
    })

    server.delete('/users/:id',{schema:DeleteUser}, async (req:FastifyRequest<{Params: typeof DeleteUser.params}>, res:FastifyReply) => {
        const id = req.params.id;
        
        return await SourceData.transaction(async (manager) => {
            const user = await manager.findOneBy(User, {id});
            
            if (!user) {
                throw Object.assign(new Error('User not found!'), {statusCode:404})
            }
            await manager.remove(User ,user);
            res.send({message:`User  has been deleted!`})
        })
    })
    
    done()
}
