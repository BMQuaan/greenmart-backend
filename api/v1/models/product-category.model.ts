import mongoose, { Document, Schema, Types } from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

export interface IProductCategory extends Document {
  categoryParentID?: Types.ObjectId | null;
  categoryName: string;
  categoryImage?: string;
  categoryStatus: "active" | "inactive";
  categoryPosition?: number;
  categorySlug?: string;
  createBy?: Types.ObjectId;
  updateBy?: Types.ObjectId;
  deleteBy?: Types.ObjectId;
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
      slug: "categoryName",
      unique: true,
    },
    createBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    updateBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    deleteBy: { type: Schema.Types.ObjectId, ref: "Staff" },
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
