import mongoose, { Document, Schema } from "mongoose";

export interface IForgotPassword extends Document {
  fpEmail: string;
  fpExpireAt: Date;
  fpOTP: string;
  fpAttempts: number;
  fpUsed: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}


const forgotPasswordSchema = new Schema<IForgotPassword>(
  {
    fpEmail: { type: String, required: true },
    fpExpireAt: { type: Date, required: true, index: { expires: 0 } },
    fpOTP: { type: String, required: true },
    fpAttempts: { type: Number, default: 0 },
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
