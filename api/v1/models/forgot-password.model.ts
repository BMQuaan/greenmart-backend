import mongoose, { Document, Schema, Types } from "mongoose";

export interface IForgotPassword extends Document {
  fpUserId: Types.ObjectId; 
  fpEmail: string;
  fpExpireAt: Date;
  fpOTP: string;
  fpUsed: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}


const forgotPasswordSchema = new Schema<IForgotPassword>(
  {
    fpUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    fpEmail: { type: String, required: true },
    fpExpireAt: { type: Date, required: true, index: { expires: 0 } },
    fpOTP: { type: String, required: true },
    fpUsed: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);


const ForgotPasswordModel = mongoose.model<IForgotPassword>(
  "ForgotPassword",
  forgotPasswordSchema,
  "forgot-passwords"
);

export default ForgotPasswordModel;
