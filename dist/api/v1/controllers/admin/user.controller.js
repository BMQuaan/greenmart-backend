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
exports.deleteUser = exports.updateUser = exports.detail = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const search_1 = require("../../../../helper/search");
const uploadCloudinary_1 = require("../../../../helper/uploadCloudinary");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectSearch = (0, search_1.SearchHelper)(req.query);
        const find = {
            deleted: false,
        };
        if (req.query.keyword) {
            const regex = objectSearch.regex;
            find["$or"] = [
                { userName: regex },
            ];
        }
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue;
        }
        else {
            sort.createdAt = "desc";
        }
        const users = yield user_model_1.default.find(find)
            .sort(sort)
            .select("-userPassword -userRefreshTokens");
        res.status(200).json({
            code: 200,
            message: "Users list",
            info: users,
        });
    }
    catch (error) {
        console.error("Error in user index:", error);
        res.status(500).json({
            code: 500,
            message: "Server error"
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({
            _id: req.params.id,
            deleted: false
        }).select("-userPassword -userRefreshTokens")
            .populate("updateBy.staffID", "staffName")
            .populate("deleteBy.staffID", "staffName")
            .select("-__v");
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: "User not found"
            });
        }
        res.status(200).json({
            code: 200,
            message: "User detail",
            info: user
        });
    }
    catch (error) {
        console.error("Error in user detail:", error);
        res.status(500).json({
            code: 500,
            message: "Server error"
        });
    }
});
exports.detail = detail;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userID = req.params.id;
        const { userName, userPhone, userAddress, userStatus } = req.body;
        const infoStaff = req["infoStaff"];
        const user = yield user_model_1.default.findOne({ _id: userID, deleted: false });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.body.userEmail || req.body.userPassword) {
            return res.status(400).json({ message: "Email and password cannot be updated here." });
        }
        if (userName !== undefined)
            user.userName = userName;
        if (userPhone !== undefined)
            user.userPhone = userPhone;
        if (userAddress !== undefined)
            user.userAddress = userAddress;
        if (userStatus !== undefined)
            user.userStatus = userStatus;
        if (req.file) {
            const avatarUrl = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "users");
            user.userAvatar = avatarUrl;
        }
        (_a = user.updateBy) === null || _a === void 0 ? void 0 : _a.push({
            staffID: infoStaff._id,
            date: new Date()
        });
        yield user.save();
        return res.status(200).json({
            message: "User updated successfully",
        });
    }
    catch (err) {
        console.error("Update user error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.id;
        const infoStaff = req["infoStaff"];
        const user = yield user_model_1.default.findOne({ _id: userID, deleted: false });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.deleted = true;
        user.deleteBy = {
            staffID: infoStaff._id,
            date: new Date()
        };
        yield user.save();
        return res.status(200).json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error("Delete user error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteUser = deleteUser;
