import bcrypt from "bcryptjs";
import { User } from "../entities/user.js";
import { SourceData } from "../db.js";
import { Type } from "@sinclair/typebox";
import fastifyJwt from "@fastify/jwt";
const Register = {
    body: Type.Object({
        name: Type.String(),
        email: Type.String(),
        password: Type.String(),
        phone: Type.Number(),
        address: Type.String()
    })
};
const Login = {
    body: Type.Object({
        email: Type.String(),
        password: Type.String()
    })
};
export const user_authRoute = (server, options, done) => {
    const userRepo = SourceData.getRepository(User);
    server.post('/register', { schema: Register }, async (req, res) => {
        const { name, email, password, phone, address } = req.body;
        const exist = await userRepo.findOneBy({ email: email });
        if (exist) {
            throw Object.assign(new Error('Email already exist!'), { statusCode: 409 });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = userRepo.create({ name, email, password: hash, phone, address });
        const saved = await userRepo.save(user);
        res.status(201).send(saved);
    });
    server.post('/login', { schema: Login }, async (req, res) => {
        const { email, password } = req.body;
        const exist = await userRepo.findOneBy({ email });
        if (!exist) {
            throw Object.assign(new Error('User not found'));
        }
        const valid = await bcrypt.compare(password, exist.password);
        if (!valid) {
            throw Object.assign(new Error('Not valid'), { statusCode: 409 });
        }
        const access = server.jwt.sign({ sub: exist.id, email: exist.email }, { expiresIn: "20m" });
        const refreshToken = server.jwt.sign({ sub: exist.id }, { expiresIn: "20d" });
        res.status(200).send({ message: "Login successful", access, refreshToken, });
    });
    done();
};
//# sourceMappingURL=user_auth.js.map