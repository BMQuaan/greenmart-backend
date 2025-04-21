import mongoose, { Document, Schema } from "mongoose";
import {generateRandomString} from "../../../helper/generate";

export interface IStaff extends Document {
  staffName: string;
  staffEmail: string;
  staffPassword: string;
  staffPhone: string;
  staffAvatar?: string;
  staffAddress?: string;
  staffRefreshTokens: {
    token: string;
    device?: string;
    createdAt: Date;
    expiresAt?: Date;
  }[];
  deleted: boolean;
  staffStatus: "active" | "inactive";
  createBy?: mongoose.Types.ObjectId;
  updateBy?: mongoose.Types.ObjectId;
  deleteBy?: mongoose.Types.ObjectId;
  roleID: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    staffName: { type: String, required: true },
    staffEmail: { type: String, required: true, unique: true },
    staffPassword: { type: String, required: true },
    staffPhone: { type: String, required: true },
    staffAvatar: { type: String },
    staffAddress: { type: String },
    staffRefreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String }, 
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date }
      }
    ],
    deleted: { type: Boolean, default: false },
    staffStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    createBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    updateBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    deleteBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    roleID: { type: Schema.Types.ObjectId, ref: "Role", required: true }
  },
  { timestamps: true }
);

const Staff = mongoose.model<IStaff>("Staff", staffSchema, "staffs");

export default Staff;
