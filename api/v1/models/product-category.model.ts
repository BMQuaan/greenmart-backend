import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProductCategory extends Document {
  categoryParentID?: Types.ObjectId | null;
  categoryName: string;
  categoryImage?: string;
  categoryStatus: "active" | "inactive";
  categoryPosition?: number;
  categorySlug?: string;
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
  deleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const productCategorySchema = new Schema<IProductCategory>(
  {
    categoryParentID: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    categoryName: { type: String, required: true },
    categoryImage: { type: String },
    categoryStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    categoryPosition: { type: Number, default: 0 },
    categorySlug: {
      type: String,
      unique: true,
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
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const ProductCategoryModel = mongoose.model<IProductCategory>(
  "ProductCategory",
  productCategorySchema,
  "products-category"
);

export default ProductCategoryModel;
