"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePermission = exports.authenticateStaffToken = void 0;
const staff_model_1 = __importDefault(require("../../models/staff.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateStaffToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Access token not provided" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const staff = yield staff_model_1.default.findOne({
            _id: decoded.id,
            deleted: false,
            staffStatus: "active"
        })
            .select("staffName staffEmail staffPhone staffAvatar staffAddress roleID")
            .populate("roleID", "_id roleName roleDescription rolePermissions");
        if (!staff) {
            return res.status(403).json({ message: "Account is invalid or has been disabled" });
        }
        req["infoStaff"] = staff;
        next();
    }
    catch (err) {
        console.error("Staff auth middleware error:", err);
        return res.status(403).json({ message: "Invalid or expired access token" });
    }
});
exports.authenticateStaffToken = authenticateStaffToken;
const authorizePermission = (permission) => {
    return (req, res, next) => {
        const staff = req["infoStaff"];
        if (!staff || !staff.roleID || !Array.isArray(staff.roleID.rolePermissions)) {
            return res.status(403).json({ message: "Access denied. Invalid role info." });
        }
        const hasPermission = staff.roleID.rolePermissions.includes(permission);
        if (!hasPermission) {
            return res.status(403).json({ message: "Access denied. Missing permission!" });
        }
        next();
    };
};
exports.authorizePermission = authorizePermission;
