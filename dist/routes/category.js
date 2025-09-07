import { Category } from "../entities/category.js";
import { SourceData } from "../db.js";
import { Type } from "@sinclair/typebox";
const CategoryAdd = {
    body: Type.Object({
        name: Type.String(),
        parentId: Type.Number()
    })
};
const CategoryUpdate = {
    params: Type.Object({
        id: Type.Number()
    }),
    body: Type.Object({
        name: Type.String(),
        parentId: Type.Number()
    })
};
const CategoryDelete = {
    params: Type.Object({
        id: Type.Number()
    })
};
export const categoryRoute = (server, options, done) => {
    server.post('/category', { schema: CategoryAdd }, async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const { name, parentId } = req.body;
            const category = manager.create(Category, { name: name, parentId: parentId });
            const saved = await manager.save(Category, category);
            res.status(201).send(saved);
        });
    });
    server.get('/category', async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const { page = "1", limit = "20", q } = req.query;
            const pageN = Number(page);
            const limitN = Number(limit);
            const fil = manager.createQueryBuilder(Category, 'category');
            if (q) {
                fil.andWhere('category.name LIKE :q', { q: `%${q}%` });
            }
            fil.skip((pageN - 1) * limitN);
            fil.take(limitN);
            const result = await fil.getMany();
            if (result.length > 0) {
                res.status(200).send(result);
            }
            else {
                throw Object.assign(new Error('Category not found'), { statusCode: 404 });
            }
        });
    });
    server.get("/category/:id", { schema: CategoryDelete }, async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const id = req.params.id;
            const category = await manager.findOneBy(Category, { id: id });
            if (!category) {
                throw Object.assign(new Error('Category not found'), { statusCode: 404 });
            }
            else {
                res.status(200).send(category);
            }
        });
    });
    server.put('/category/:id', { schema: CategoryUpdate }, async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const id = req.params.id;
            const category = await manager.findOneBy(Category, { id });
            const { name, parentId } = req.body;
            if (!category) {
                throw Object.assign(new Error('Category not found'));
            }
            else {
                manager.merge(Category, category, { name, parentId });
                const saved = await manager.save(Category, category);
                res.status(200).send(saved);
            }
        });
    });
    server.delete('/category/:id', { schema: CategoryDelete }, async (req, res) => {
        return await SourceData.transaction(async (manager) => {
            const id = req.params.id;
            const category = await manager.findOneBy(Category, { id: id });
            if (!category) {
                throw Object.assign(new Error('Category not found'));
            }
            else {
                await manager.remove(Category, category);
                res.status(200).send({ message: 'Category has been removed!' });
            }
        });
    });
    done();
};
//# sourceMappingURL=category.js.map