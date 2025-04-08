import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  productID: Types.ObjectId;
  productPrice: number;
  productDiscountPercentage?: number;
  quantity: number;
}

export interface IOrder extends Document {
  customerID: Types.ObjectId;
  customerInfor: {
    name: string;
    address: string;
    phone: string;
  };
  orderItemList: IOrderItem[];
  orderStatus: "delivered"; 
  orderPaymentMethod: "cod";
  promotionID?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customerID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerInfor: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    orderItemList: [
      {
        productID: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        productPrice: { type: Number, required: true },
        productDiscountPercentage: { type: Number, default: 0 },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    orderStatus: {
      type: String,
      enum: ["delivered"],
      default: "delivered",
    },
    orderPaymentMethod: {
      type: String,
      enum: ["cod"],
      required: true,
    },
    promotionID: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      default: null,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<IOrder>("Order", orderSchema, "orders");

export default OrderModel;
