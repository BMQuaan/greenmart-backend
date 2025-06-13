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
exports.productcategoryRoutes = void 0;
const express_1 = require("express");
const controller = __importStar(require("../../controllers/admin/product-category.controller"));
const authMiddleware = __importStar(require("../../middlewares/admin/auth.middleware"));
const upload_middleware_1 = __importDefault(require("../../middlewares/admin/upload.middleware"));
const validateRequest_1 = __importDefault(require("../../middlewares/admin/validateRequest"));
const product_category_validation_1 = require("../../validations/admin/product-category.validation");
const parseFormData_middleware_1 = require("../../middlewares/admin/parseFormData.middleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.index);
router.get("/detail/:slug", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.detail);
router.get("/categorytree", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("view_category"), controller.categoryTrees);
router.post("/add", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("add_category"), upload_middleware_1.default.single("categoryImage"), (0, parseFormData_middleware_1.parseFormDataNumbers)(["categoryPosition"]), (0, validateRequest_1.default)(product_category_validation_1.addProductCategorySchema), controller.addCategory);
router.put("/update/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("edit_category"), upload_middleware_1.default.single("categoryImage"), (0, parseFormData_middleware_1.parseFormDataNumbers)(["categoryPosition"]), (0, validateRequest_1.default)(product_category_validation_1.updateProductCategorySchema), controller.updateCategory);
router.delete("/delete/:id", authMiddleware.authenticateStaffToken, authMiddleware.authorizePermission("delete_category"), (0, validateRequest_1.default)(product_category_validation_1.deleteProductCategorySchema), controller.deleteCategory);
exports.productcategoryRoutes = router;
