import mongoose, { Document, Schema, Types } from "mongoose";


export interface IUser extends Document {
  userName: string;
  userEmail: string;
  userPassword: string;
  userPhone?: string;
  userAvatar?: string;
  userAddress?: string;
  userRefreshTokens: {
    token: string;
    device?: string;
    createdAt: Date;
    expiresAt?: Date;
  }[];
  deleted: boolean;
  userStatus: "active" | "inactive";
  deleteBy?: Types.ObjectId; 
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
    userRefreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String }, 
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date }
      }
    ]
    ,
    deleted: { type: Boolean, default: false },
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
