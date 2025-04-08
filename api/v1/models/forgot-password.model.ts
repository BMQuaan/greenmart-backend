import mongoose, { Document, Schema } from "mongoose";

export interface IForgotPassword extends Document {
  fpEmail: string;
  fpExpireAt: Date;
  fpOTP: string;
  fpAttempts: number;
  fpIsUser: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const forgotPasswordSchema = new Schema<IForgotPassword>(
  {
    fpEmail: { type: String, required: true },
    fpExpireAt: { type: Date, required: true },
    fpOTP: { type: String, required: true },
    fpAttempts: { type: Number, default: 0 },
    fpIsUser: { type: Boolean, required: true }, // true: user, false: staff/admin
  },
  { timestamps: true }
);

const ForgotPasswordModel = mongoose.model<IForgotPassword>(
  "ForgotPassword",
  forgotPasswordSchema,
  "forgot_passwords"
);

export default ForgotPasswordModel;
