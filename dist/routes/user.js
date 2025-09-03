import { User } from '../entities/user.js';
import { SourceData } from '../db.js';
const Items = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        name: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        createdAt: { type: 'string' }
    }
};
const showUser = {
    schema: {
        response: {
            200: {
                type: 'array',
                items: Items
            },
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            },
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};
const addUser = {
    schema: {
        body: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
            }
        },
        response: {
            201: Items,
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};
const singleUser = {
    schema: {
        params: {
            type: 'object',
            properties: {
                id: { type: 'number' }
            },
            required: ['id']
        },
        response: {
            200: Items,
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            },
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};
const updateUser = {
    schema: {
        params: {
            type: 'object',
            properties: {
                id: { type: 'number' }
            },
            required: ['id']
        },
        body: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
            }
        },
        response: {
            200: Items,
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            },
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};
const userDelete = {
    schema: {
        params: {
            type: 'object',
            properties: { id: { type: 'number' } },
            required: ['id']
        },
        response: {
            200: { message: { type: 'string' } },
            404: {
                error: { type: 'string' },
                message: { type: 'string' }
            },
            500: {
                error: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
};
export const userRoutes = (server, options, done) => {
    server.get('/', (req, res) => {
        res.send('welcome!');
    });
    server.get('/users', showUser, async (req, res) => {
        try {
            const { page = 1, limit = 20, name, email } = req.query;
            const userRepo = SourceData.getRepository(User);
            const query = userRepo.createQueryBuilder('user');
            if (name) {
                query.andWhere('user.name LIKE :name', { name: `%${name}%` });
            }
            if (email) {
                query.andWhere('user.email LIKE :email', { email: `%${email}%` });
            }
            query.take(limit);
            const users = await query.getMany();
            if (users.length == 0) {
                res.status(404).send({ error: 'Not found!', message: 'User not found' });
            }
            else {
                res.status(200).send(users);
            }
        }
        catch (err) {
            res.status(500).send({ error: 'Internet server error',
                message: err.message
            });
        }
    });
    server.post('/users', addUser, async (req, res) => {
        try {
            const { name, email, phone, address } = req.body;
            const userRepo = SourceData.getRepository(User);
            const newUser = userRepo.create({ name, email, phone, address });
            const saveUser = await userRepo.save(newUser);
            res.status(201).send(saveUser);
        }
        catch (err) {
            res.status(500).send({ error: err, message: 'Internet server error' });
        }
    });
    server.get('/users/:id', singleUser, async (req, res) => {
        const id = req.params.id;
        const userRepo = SourceData.getRepository(User);
        try {
            const user = await userRepo.findOneBy({ id });
            if (!user) {
                res.status(404).send({
                    error: 'Not found',
                    message: 'User not found!'
                });
            }
            else {
                res.status(200).send(user);
            }
        }
        catch (err) {
            res.status(500).send({
                error: err,
                message: 'Internet server error'
            });
        }
    });
    server.put('/users/:id', updateUser, async (req, res) => {
        const id = req.params.id;
        const userRepo = SourceData.getRepository(User);
        const updateData = req.body;
        try {
            const user = await userRepo.findOneBy({ id });
            if (!user) {
                res.status(404).send({ error: 'Not found', message: 'User not found' });
            }
            else {
                userRepo.merge(user, updateData);
                const saved = await userRepo.save(user);
                res.status(200).send(saved);
            }
        }
        catch (err) {
            res.status(500).send({
                error: err,
                message: 'Internet server error'
            });
        }
    });
    server.delete('/users/:id', userDelete, async (req, res) => {
        const id = req.params.id;
        try {
            const userRepo = SourceData.getRepository(User);
            const user = await userRepo.findOneBy({ id });
            if (!user) {
                res.status(404).send({ error: 'Not found', message: 'User not found!' });
            }
            else {
                await userRepo.remove(user);
                res.status(200).send({ message: `User with ID: ${id} has been deleted!` });
            }
        }
        catch (err) {
            res.status(500).send({ error: err.message, message: 'Internet server error!' });
        }
    });
    done();
};
//# sourceMappingURL=user.js.map