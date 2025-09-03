var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
export class NewInventory {
    productId;
    warehouseId;
    delta;
    reason;
}
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], NewInventory.prototype, "productId", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], NewInventory.prototype, "warehouseId", void 0);
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], NewInventory.prototype, "delta", void 0);
__decorate([
    IsNotEmpty(),
    __metadata("design:type", String)
], NewInventory.prototype, "reason", void 0);
export class ChangeInventory {
    productId;
    fromWarehouseId;
    toWarehouseId;
    quantity;
}
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], ChangeInventory.prototype, "productId", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], ChangeInventory.prototype, "fromWarehouseId", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], ChangeInventory.prototype, "toWarehouseId", void 0);
__decorate([
    IsPositive(),
    __metadata("design:type", Number)
], ChangeInventory.prototype, "quantity", void 0);
//# sourceMappingURL=inventory.js.map