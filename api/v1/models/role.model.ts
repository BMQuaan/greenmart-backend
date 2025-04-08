import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  roleName: string;
  roleDescription?: string;
  rolePermissions: string[];
  roleIsDeleted: boolean;
  createBy?: mongoose.Types.ObjectId;
  updateBy?: mongoose.Types.ObjectId;
  deleteBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const roleSchema = new Schema<IRole>(
  {
    roleName: { type: String, required: true, unique: true },
    roleDescription: { type: String },
    rolePermissions: { type: [String], default: [] },
    roleIsDeleted: { type: Boolean, default: false },
    createBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    updateBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    deleteBy: { type: Schema.Types.ObjectId, ref: "Staff" }
  },
  { timestamps: true }
);

const Role = mongoose.model<IRole>("Role", roleSchema, "roles");

export default Role;
