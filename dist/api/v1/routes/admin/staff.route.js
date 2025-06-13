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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = void 0;
const express_1 = require("express");
const controller = __importStar(require("../../controllers/admin/staff.controller"));
const authMiddleware = __importStar(require("../../middlewares/admin/auth.middleware"));
const upload_middleware_1 = __importDefault(require("../../middlewares/admin/upload.middleware"));
const validateRequest_1 = __importDefault(require("../../middlewares/admin/validateRequest"));
const staff_validation_1 = require("../../validations/admin/staff.validation");
const router = (0, express_1.Router)();
router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_staff"), controller.index);
router.get("/detail/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_staff"), controller.detail);
router.post("/add", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("add_staff"), upload_middleware_1.default.single("staffAvatar"), (0, validateRequest_1.default)(staff_validation_1.addStaffSchema), controller.addStaff);
router.put("/update/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("edit_staff"), upload_middleware_1.default.single("staffAvatar"), (0, validateRequest_1.default)(staff_validation_1.updateStaffSchema), controller.updateStaff);
router.delete("/delete/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("delete_staff"), (0, validateRequest_1.default)(staff_validation_1.deleteStaffSchema), controller.deleteStaff);
exports.staffRoutes = router;
