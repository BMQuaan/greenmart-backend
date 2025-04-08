import mongoose, { Document, Schema } from "mongoose";

export interface IPromotion extends Document {
  promotionDescription: string;
  promotionPercentage: number;
  promotionMinOrderValue: number;
  startDate: Date;
  endDate: Date;
  promotionIsActive: boolean;
  createBy?: mongoose.Types.ObjectId;
  updateBy?: mongoose.Types.ObjectId;
  deleteBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    promotionDescription: { type: String, required: true },
    promotionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    promotionMinOrderValue: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    promotionIsActive: { type: Boolean, default: true },
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    updateBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

const Promotion = mongoose.model<IPromotion>("Promotion", promotionSchema, "promotions");

export default Promotion;
