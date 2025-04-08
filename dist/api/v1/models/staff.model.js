"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const generate_1 = require("../../../helper/generate");
const staffSchema = new mongoose_1.Schema({
    staffName: { type: String, required: true },
    staffEmail: { type: String, required: true, unique: true },
    staffPassword: { type: String, required: true },
    staffPhone: { type: String, required: true },
    staffAvatar: { type: String },
    staffAddress: { type: String },
    staffToken: {
        type: String,
        default: () => (0, generate_1.generateRandomString)(30)
    },
    staffIsDeleted: { type: Boolean, default: false },
    staffStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    createBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staff" },
    updateBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staff" },
    deleteBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Staff" },
    roleID: { type: mongoose_1.Schema.Types.ObjectId, ref: "Role", required: true }
}, { timestamps: true });
const Staff = mongoose_1.default.model("Staff", staffSchema, "staffs");
exports.default = Staff;
