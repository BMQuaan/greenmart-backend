import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  productImage?: string;
  productStock: number;
  productDescription?: string;
  productStatus: "active" | "inactive";
  productPosition: number;
  productDiscountPercentage: number;
  productSlug: string;
  categoryID: mongoose.Types.ObjectId;
  createBy?: {
    staffID: Types.ObjectId;
    date: Date;
  };

  updateBy?: {
    staffID: Types.ObjectId;
    date: Date;
  }[];

  deleteBy?: {
    staffID: Types.ObjectId;
    date: Date;
  };
  deleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String },
    productStock: { type: Number, default: 0 },
    productDescription: { type: String },
    productStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    productPosition: { type: Number, default: 0 },
    productDiscountPercentage: { type: Number, default: 0 },
    productSlug: {
      type: String,
      unique: true
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    createBy: {
      staffID: { type: Schema.Types.ObjectId, ref: "Staff" },
      date: { type: Date, default: Date.now }
    },

    updateBy: [
      {
        staffID: { type: Schema.Types.ObjectId, ref: "Staff" },
        date: { type: Date, default: Date.now }
      }
    ],

    deleteBy: {
      staffID: { type: Schema.Types.ObjectId, ref: "Staff" },
      date: { type: Date }
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema, "products");

export default Product;
