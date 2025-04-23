import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRole extends Document {
  roleName: string;
  roleDescription?: string;
  rolePermissions: string[];
  roleIsDeleted: boolean;
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

const roleSchema = new Schema<IRole>(
  {
    roleName: { type: String, required: true, unique: true },
    roleDescription: { type: String },
    rolePermissions: { type: [String], default: [] },
    roleIsDeleted: { type: Boolean, default: false },
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
    }
  },
  { timestamps: true }
);

const Role = mongoose.model<IRole>("Role", roleSchema, "roles");

export default Role;
