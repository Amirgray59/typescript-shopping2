import {IsInt, IsNotEmpty, IsNumber, IsPositive} from "class-validator";

export class NewInventory {
  @IsNumber()
  productId!: number;
  @IsNumber()
  warehouseId!: number;

  @IsInt()
  delta!: number;

  @IsNotEmpty()
  reason!: string;
}

export class ChangeInventory{
  @IsNumber()
  productId!: number;

  @IsNumber()
  fromWarehouseId!: number;

  @IsNumber()
  toWarehouseId!: number;

  @IsPositive()
  quantity!: number;
}
