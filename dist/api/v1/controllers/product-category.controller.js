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
exports.index = void 0;
const product_category_model_1 = __importDefault(require("../../v1/models/product-category.model"));
const buildCategoryTree = (categories, parentId = null) => {
    return categories
        .filter(cat => String(cat.categoryParentID) === String(parentId))
        .map(cat => (Object.assign(Object.assign({}, cat), { children: buildCategoryTree(categories, cat._id) })));
};
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield product_category_model_1.default.find({
            categoryStatus: "active",
            deleted: false,
        })
            .select("_id categoryName categorySlug categoryImage categoryParentID")
            .sort({ categoryPosition: -1 })
            .lean();
        const categoryTree = buildCategoryTree(categories);
        res.status(200).json({
            code: 200,
            message: "All products-category (tree format)",
            info: categoryTree,
        });
    }
    catch (error) {
        console.error("Error building category tree:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
        });
    }
});
exports.index = index;
