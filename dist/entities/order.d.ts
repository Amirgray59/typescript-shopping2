export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | 'CANCELLED';
export declare class Order {
    id: number;
    userId: number;
    status: OrderStatus;
    items: OrderItem[];
    total: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class OrderItem {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    order: Order;
}
//# sourceMappingURL=order.d.ts.map