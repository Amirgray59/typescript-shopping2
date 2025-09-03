import { IsNumber,IsArray, IsOptional, IsEnum } from "class-validator";
import { Type } from "class-transformer";

class OrderItemInput {
  @IsNumber()
  productId!: number;
  @IsNumber()
  quantity!: number;
}

export class CreateOrderDto {
  @IsNumber()
  userId!: number;


  @IsArray()
  @Type(() => OrderItemInput)
  items!: OrderItemInput[];

  @IsOptional()
  paymentMethod?: "CARD" | "CASH" | "WALLET";
}

export class UpdateOrderStatusDto {
  @IsEnum(["PENDING", "PAID", "SHIPPED", "CANCELLED"])
  status!: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
}
