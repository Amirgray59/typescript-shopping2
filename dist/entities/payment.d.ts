import { Order } from "./order.js";
export type Status = "PENDING" | "SUCCESS" | "FAILED";
export declare class Payment {
    id: number;
    orderId: Order;
    amount: number;
    status: Status;
    transactionRef: string;
    createdAt: Date;
}
//# sourceMappingURL=payment.d.ts.map