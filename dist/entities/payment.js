var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne } from "typeorm";
import { Order } from "./order.js";
let Payment = class Payment {
    id;
    orderId;
    amount;
    status;
    transactionRef;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Payment.prototype, "id", void 0);
__decorate([
    OneToOne(() => Order),
    __metadata("design:type", Order)
], Payment.prototype, "orderId", void 0);
__decorate([
    Column('float'),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    Column({ default: 'PENDING' }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    Column('varchar'),
    __metadata("design:type", String)
], Payment.prototype, "transactionRef", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
Payment = __decorate([
    Entity()
], Payment);
export { Payment };
//# sourceMappingURL=payment.js.map