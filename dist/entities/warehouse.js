var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from "typeorm";
import { Inventory } from "./inventory.js";
let Warehouse = class Warehouse {
    id;
    name;
    location;
    inventories;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Warehouse.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Warehouse.prototype, "name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Warehouse.prototype, "location", void 0);
__decorate([
    OneToMany(() => Inventory, (inventory) => inventory.warehouse),
    __metadata("design:type", Array)
], Warehouse.prototype, "inventories", void 0);
Warehouse = __decorate([
    Entity()
], Warehouse);
export { Warehouse };
//# sourceMappingURL=warehouse.js.map