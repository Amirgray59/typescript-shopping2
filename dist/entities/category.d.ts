import { Product } from './product.js';
export declare class Category {
    id: number;
    name: string;
    parentId: number;
    children?: Category[];
    products?: Product[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=category.d.ts.map