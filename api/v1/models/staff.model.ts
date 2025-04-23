import mongoose, { Document, Schema, Types } from "mongoose";

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
    roleID: { type: Schema.Types.ObjectId, ref: "Role", required: true }
  },
  { timestamps: true }
);

const Staff = mongoose.model<IStaff>("Staff", staffSchema, "staffs");

export default Staff;
