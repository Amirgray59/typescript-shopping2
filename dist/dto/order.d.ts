declare class OrderItemInput {
    productId: number;
    quantity: number;
}
export declare class CreateOrderDto {
    userId: number;
    items: OrderItemInput[];
    paymentMethod?: 'CARD' | 'CASH' | 'WALLET';
}
export declare class UpdateOrderStatusDto {
    status: "PENDING" | 'PAID' | 'SHIPPED' | 'CANCELLED';
}
export {};
//# sourceMappingURL=order.d.ts.map