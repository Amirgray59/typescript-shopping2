import { Product } from "../entities/product.js";
import { SourceData } from "../db.js";
import { UpdateProductDto } from "../dto/product.js";
import { Category } from "../entities/category.js";
import { validateOrReject } from "class-validator";
import { Type } from '@sinclair/typebox';
const Items = Type.Object({
    id: Type.Number(),
    sku: Type.String(),
    name: Type.String(),
    description: Type.String(),
    price: Type.Number(),
    createdAt: Type.String(),
});
const ProductAdd = {
    body: Type.Object({
        sku: Type.String(),
        name: Type.String(),
        description: Type.String(),
        price: Type.Number(),
        categoryId: Type.Number()
    }),
    response: {
        200: Items
    }
};
const ProductSingle = {
    params: Type.Object({
        id: Type.Number()
    })
};
const ProductUpdate = {
    params: Type.Object({
        id: Type.Number()
    }),
    body: Type.Object({
        sku: Type.String(),
        name: Type.String(),
        description: Type.String(),
        price: Type.Number(),
        categoryId: Type.Number()
    })
};
const ProductDelete = {
    params: Type.Object({
        id: Type.Number()
    }),
};
export const productRoute = (server, options, done) => {
    const productRepo = SourceData.getRepository(Product);
    const categoryRepo = SourceData.getRepository(Category);
    server.post('/products', { schema: ProductAdd }, async (req, res) => {
        const { sku, name, description, price, categoryId } = req.body;
        return await SourceData.transaction(async (manager) => {
            const category = await manager.findOneBy(Category, { id: categoryId });
            if (!category) {
                throw Object.assign(new Error('Category not found'), { statusCode: 404 });
            }
            const newPro = manager.create(Product, { sku, name, description: description, price, category });
            const saved = await manager.save(Product, newPro);
            res.status(201).send(saved);
        });
    });
    server.get('/products/:id', { schema: ProductSingle }, async (req, res) => {
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {
            const product = await manager.findOne(Product, { where: { id: id } });
            if (!product) {
                throw Object.assign(new Error('Product not found'), { statusCode: 404 });
            }
            res.status(200).send(product);
        });
    });
    server.get('/products', async (req, res) => {
        const { page = 1, limit = 20, q, categoryId, minPrice, maxPrice, sort } = req.query;
        return await SourceData.transaction(async (manager) => {
            const fil = manager.createQueryBuilder(Product, "product").leftJoinAndSelect('product.category', 'category');
            if (q) {
                fil.andWhere('product.name LIKE :q OR product.sku LIKE :q', { q: `%${q}%` });
            }
            if (categoryId) {
                fil.andWhere('product.categoryId = :categoryId', { categoryId: categoryId });
            }
            if (minPrice) {
                fil.andWhere('product.price >= :minPrice', { minPrice });
            }
            if (maxPrice) {
                fil.andWhere('product.price <= :maxPrice', { maxPrice });
            }
            if (sort) {
                const [colum, type] = sort.split(':');
                fil.orderBy(`product.${colum}`, type.toUpperCase());
            }
            fil.skip((page - 1) * limit);
            fil.take(limit);
            const results = await fil.getMany();
            res.status(200).send(results);
        });
    });
    server.put('/products/:id', { schema: ProductUpdate }, async (req, res) => {
        const id = req.params.id;
        const { sku, name, description, price, categoryId } = req.body;
        const updatePro = { sku, name, description: description || '', price, categoryId };
        return await SourceData.transaction(async (manager) => {
            const category = await manager.findOneBy(Category, { id: categoryId });
            if (!category) {
                throw Object.assign(new Error("Category not found"), { statusCode: 404 });
            }
            const pro = await manager.findOneBy(Product, { id });
            if (!pro) {
                throw Object.assign(new Error("Prodcut not found"), { statusCode: 404 });
            }
            manager.merge(Product, pro, updatePro);
            const saved = await manager.save(Product, pro);
            res.status(200).send(saved);
        });
    });
    server.delete('/products/:id', { schema: ProductDelete }, async (req, res) => {
        const id = req.params.id;
        return await SourceData.transaction(async (manager) => {
            const pro = await manager.findOneBy(Product, { id });
            if (!pro) {
                throw Object.assign(new Error('Product not found'));
            }
            await manager.remove(Product, pro);
            res.status(200).send({ message: 'Product has been removed!' });
        });
    });
    done();
};
//# sourceMappingURL=product.js.map