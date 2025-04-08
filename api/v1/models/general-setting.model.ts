import mongoose, { Document, Schema } from "mongoose";

export interface IGeneralSetting extends Document {
  gsLogo?: string;
  gsSlogan?: string;
  gsFavicon?: string;
  gsTitle: string;
  gsEmail: string;
  gsPhone: string;
  gsAddress: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const generalSettingSchema = new Schema<IGeneralSetting>(
  {
    gsLogo: { type: String },
    gsSlogan: { type: String },
    gsFavicon: { type: String },
    gsTitle: { type: String, required: true },
    gsEmail: { type: String, required: true },
    gsPhone: { type: String, required: true },
    gsAddress: { type: String, required: true },
  },
  { timestamps: true }
);

const GeneralSettingModel = mongoose.model<IGeneralSetting>(
  "GeneralSetting",
  generalSettingSchema,
  "general-settings"
);

export default GeneralSettingModel;
