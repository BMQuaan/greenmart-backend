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
exports.deleteStaff = exports.updateStaff = exports.addStaff = exports.detail = exports.index = void 0;
const staff_model_1 = __importDefault(require("../../models/staff.model"));
const search_1 = require("../../../../helper/search");
const uploadCloudinary_1 = require("../../../../helper/uploadCloudinary");
const bcrypt_1 = __importDefault(require("bcrypt"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectSearch = (0, search_1.SearchHelper)(req.query);
        const find = {
            deleted: false,
        };
        if (req.query.keyword) {
            const regex = objectSearch.regex;
            find["$or"] = [
                { staffName: regex },
            ];
        }
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue;
        }
        else {
            sort.createdAt = "desc";
        }
        const staffs = yield staff_model_1.default.find(find)
            .select("-staffPassword -staffRefreshTokens")
            .populate("roleID", "roleName")
            .sort(sort);
        res.status(200).json({
            code: 200,
            message: "Staffs list",
            info: staffs,
        });
    }
    catch (error) {
        console.error("Error in staff index:", error);
        res.status(500).json({
            code: 500,
            message: "Server error"
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staff_model_1.default.findOne({
            _id: req.params.id,
            deleted: false
        })
            .select("-staffPassword -staffRefreshTokens")
            .populate("roleID", "roleName")
            .populate("createBy.staffID", "staffName")
            .populate("updateBy.staffID", "staffName")
            .populate("deleteBy.staffID", "staffName")
            .select("-__v");
        if (!staff) {
            return res.status(404).json({
                code: 404,
                message: "Staff not found"
            });
        }
        res.status(200).json({
            code: 200,
            message: "Staff detail",
            info: staff
        });
    }
    catch (error) {
        console.error("Error in staff detail:", error);
        res.status(500).json({
            code: 500,
            message: "Server error"
        });
    }
});
exports.detail = detail;
const addStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffName, staffEmail, staffPassword, staffPhone, staffAddress, roleID } = req.body;
        const infoStaff = req["infoStaff"];
        if (!staffName || !staffEmail || !staffPassword || !staffPhone || !roleID) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existing = yield staff_model_1.default.findOne({ staffEmail, deleted: false });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        let avatarUrl = "";
        if (req.file) {
            avatarUrl = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "staffs");
        }
        const hashedPassword = yield bcrypt_1.default.hash(staffPassword, 10);
        const newStaff = new staff_model_1.default({
            staffName,
            staffEmail,
            staffPassword: hashedPassword,
            staffPhone,
            staffAvatar: avatarUrl,
            staffAddress,
            roleID,
            createBy: {
                staffID: infoStaff._id,
                date: new Date()
            }
        });
        yield newStaff.save();
        return res.status(201).json({ message: "Staff created" });
    }
    catch (error) {
        console.error("Add staff error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.addStaff = addStaff;
const updateStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const staffID = req.params.id;
        const { staffName, staffEmail, staffPassword, staffPhone, staffAddress, staffStatus, roleID } = req.body;
        const infoStaff = req["infoStaff"];
        const staff = yield staff_model_1.default.findOne({ _id: staffID, deleted: false });
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        if (staffEmail) {
            const existingStaffWithEmail = yield staff_model_1.default.findOne({
                staffEmail,
                deleted: false,
                _id: { $ne: staffID },
            });
            if (existingStaffWithEmail) {
                return res.status(400).json({ message: "Email is already in use" });
            }
        }
        if (req.file) {
            const avatarUrl = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "staffs");
            staff.staffAvatar = avatarUrl;
        }
        if (staffName !== undefined)
            staff.staffName = staffName;
        if (staffEmail !== undefined)
            staff.staffEmail = staffEmail;
        if (staffPhone !== undefined)
            staff.staffPhone = staffPhone;
        if (staffAddress !== undefined)
            staff.staffAddress = staffAddress;
        if (staffStatus !== undefined)
            staff.staffStatus = staffStatus;
        if (roleID !== undefined)
            staff.roleID = roleID;
        if (staffPassword) {
            const hashedPassword = yield bcrypt_1.default.hash(staffPassword, 10);
            staff.staffPassword = hashedPassword;
        }
        (_a = staff.updateBy) === null || _a === void 0 ? void 0 : _a.push({
            staffID: infoStaff._id,
            date: new Date()
        });
        yield staff.save();
        return res.status(200).json({
            code: 200,
            message: "Staff updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating staff:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateStaff = updateStaff;
const deleteStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const infoStaff = req["infoStaff"];
        const staff = yield staff_model_1.default.findOne({ _id: id, deleted: false });
        if (!staff)
            return res.status(404).json({ message: "Staff not found" });
        staff.deleted = true;
        staff.deleteBy = {
            staffID: infoStaff._id,
            date: new Date()
        };
        yield staff.save();
        return res.status(200).json({ message: "Staff deleted successfully" });
    }
    catch (error) {
        console.error("Delete staff error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteStaff = deleteStaff;
