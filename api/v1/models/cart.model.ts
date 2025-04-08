import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItem {
  productID: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userID: Types.ObjectId;
  cartList: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cartList: [
      {
        productID: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const CartModel = mongoose.model<ICart>("Cart", cartSchema, "carts");
export default CartModel;
