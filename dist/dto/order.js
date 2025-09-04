var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNumber, IsArray, IsOptional, IsEnum } from "class-validator";
import { Type } from "class-transformer";
class OrderItemInput {
    productId;
    quantity;
}
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], OrderItemInput.prototype, "productId", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], OrderItemInput.prototype, "quantity", void 0);
export class CreateOrderDto {
    userId;
    items;
    paymentMethod;
}
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "userId", void 0);
__decorate([
    IsArray(),
    Type(() => OrderItemInput),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
export class UpdateOrderStatusDto {
    status;
}
__decorate([
    IsEnum(["PENDING", "PAID", "SHIPPED", 'CANCELLED']),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
//# sourceMappingURL=order.js.map