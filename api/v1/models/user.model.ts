import mongoose, { Document, Schema, Types } from "mongoose";
import {generateRandomString} from "../../../helper/generate";


export interface IUser extends Document {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhone?: string;
  userAvatar?: string;
  userAddress?: string;
  userToken?: string;
  userIsDeleted: boolean;
  userStatus: "active" | "inactive";
  deleteBy?: Types.ObjectId; // Ref tới Staff
  updateBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userPhone: { type: String },
    userAvatar: { type: String },
    userAddress: { type: String },
    userToken: {
      type: String,
      default: () => generateRandomString(30),
    },
    userIsDeleted: { type: Boolean, default: false },
    userStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deleteBy: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
    updateBy: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>("User", userSchema, "users");
export default UserModel;
