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
exports.logoutStaff = exports.update = exports.detail = exports.refreshStaffAccessToken = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const staff_model_1 = __importDefault(require("../../models/staff.model"));
require("../../models/role.model");
const uploadCloudinary_1 = require("../../../../helper/uploadCloudinary");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffEmail, staffPassword } = req.body;
        const staff = yield staff_model_1.default.findOne({ staffEmail, deleted: false }).populate({
            path: "roleID",
            select: "_id roleName rolePermissions"
        });
        if (!staff) {
            return res.status(400).json({
                code: 400,
                message: "Email does not exist",
            });
        }
        if (staff.staffStatus !== "active") {
            return res.status(403).json({
                code: 403,
                message: "Account is inactive",
            });
        }
        const isPasswordCorrect = yield bcrypt_1.default.compare(staffPassword, staff.staffPassword);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                code: 400,
                message: "Incorrect email or password",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({
            id: staff._id,
            email: staff.staffEmail,
            role: staff.roleID._id,
        }, JWT_SECRET, { expiresIn: "6h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: staff._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
        staff.staffRefreshTokens = staff.staffRefreshTokens.filter(tokenObj => tokenObj.expiresAt && tokenObj.expiresAt > new Date());
        if (staff.staffRefreshTokens.length >= 3) {
            staff.staffRefreshTokens.shift();
        }
        staff.staffRefreshTokens.push({
            token: refreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        yield staff.save();
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SECURE ? "none" : "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            code: 200,
            message: "Login successful",
            accessToken: accessToken,
            info: {
                id: staff._id,
                name: staff.staffName,
                email: staff.staffEmail,
                phone: staff.staffPhone,
                address: staff.staffAddress,
                avatar: staff.staffAvatar,
                role: staff.roleID,
            },
        });
    }
    catch (error) {
        console.error("Staff login error:", error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.login = login;
const refreshStaffAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken)
        return res.sendStatus(401);
    try {
        const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
        const staff = yield staff_model_1.default.findOne({
            _id: decoded.id,
            deleted: false,
            staffStatus: "active",
            "staffRefreshTokens.token": oldRefreshToken,
            "staffRefreshTokens.expiresAt": { $gt: new Date() }
        }).populate({
            path: "roleID",
            select: "_id roleName rolePermissions"
        });
        if (!staff) {
            return res.sendStatus(403);
        }
        staff.staffRefreshTokens = staff.staffRefreshTokens.filter((tokenObj) => tokenObj.token !== oldRefreshToken);
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: staff._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        staff.staffRefreshTokens.push({
            token: newRefreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        yield staff.save();
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SECURE ? "none" : "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: staff._id,
            email: staff.staffEmail,
            role: staff.roleID._id
        }, process.env.JWT_SECRET, { expiresIn: "6h" });
        res.status(200).json({
            accessToken: newAccessToken,
            info: {
                id: staff._id,
                name: staff.staffName,
                email: staff.staffEmail,
                phone: staff.staffPhone,
                address: staff.staffAddress,
                avatar: staff.staffAvatar,
                role: staff.roleID,
            },
        });
    }
    catch (err) {
        console.error("Staff refresh token error:", err);
        return res.sendStatus(403);
    }
});
exports.refreshStaffAccessToken = refreshStaffAccessToken;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({
            code: 200,
            message: "Detail staff profile",
            info: req["infoStaff"],
        });
    }
    catch (error) {
        console.error("Error in staff detail:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
        });
    }
});
exports.detail = detail;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffInfo = req["infoStaff"];
        const { staffName, staffPhone, staffAddress } = req.body;
        let avatarUrl;
        if (req.file) {
            avatarUrl = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "avatars");
        }
        const staff = yield staff_model_1.default.findById(staffInfo._id);
        if (!staff || staff.deleted || staff.staffStatus !== "active") {
            return res.status(404).json({ code: 404, message: "Staff not found or inactive" });
        }
        if (staffName !== undefined)
            staff.staffName = staffName;
        if (staffPhone !== undefined)
            staff.staffPhone = staffPhone;
        if (staffAddress !== undefined)
            staff.staffAddress = staffAddress;
        if (avatarUrl)
            staff.staffAvatar = avatarUrl;
        yield staff.save();
        yield staff.populate("roleID");
        return res.status(200).json({
            code: 200,
            message: "Staff updated successfully",
            info: {
                id: staff._id,
                name: staff.staffName,
                email: staff.staffEmail,
                phone: staff.staffPhone,
                address: staff.staffAddress,
                avatar: staff.staffAvatar,
                role: staff.roleID,
            },
        });
    }
    catch (error) {
        console.error("Update staff error:", error);
        return res.status(500).json({ code: 500, message: "Server error during update" });
    }
});
exports.update = update;
const logoutStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(200).json("Logged out!");
    }
    try {
        yield staff_model_1.default.updateOne({ 'staffRefreshTokens.token': refreshToken }, { $pull: { staffRefreshTokens: { token: refreshToken } } });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SECURE ? "none" : "strict",
            path: "/",
        });
        return res.status(200).json("Logged out!");
    }
    catch (error) {
        console.error("Staff logout error:", error);
        return res.status(500).json("Server error during logout");
    }
});
exports.logoutStaff = logoutStaff;
