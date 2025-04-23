import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPromotion extends Document {
  promotionDescription: string;
  promotionPercentage: number;
  promotionMinOrderValue: number;
  startDate: Date;
  endDate: Date;
  promotionIsActive: boolean;
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
  },
  { timestamps: true }
);

const Promotion = mongoose.model<IPromotion>("Promotion", promotionSchema, "promotions");

export default Promotion;
