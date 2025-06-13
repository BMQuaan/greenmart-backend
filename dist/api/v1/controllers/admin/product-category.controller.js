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
exports.deleteCategory = exports.updateCategory = exports.addCategory = exports.categoryTrees = exports.detail = exports.index = void 0;
const product_category_model_1 = __importDefault(require("../../models/product-category.model"));
const search_1 = require("../../../../helper/search");
const uploadCloudinary_1 = require("../../../../helper/uploadCloudinary");
const slugify_1 = __importDefault(require("slugify"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectSearch = (0, search_1.SearchHelper)(req.query);
        const find = {
            deleted: false,
        };
        if (req.query.keyword) {
            find.categoryName = objectSearch.regex;
        }
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue;
        }
        else {
            sort.position = "desc";
        }
        const productCategories = yield product_category_model_1.default.find(find).sort(sort);
        res.status(200).json({
            code: 200,
            message: "All product categories",
            info: productCategories,
        });
    }
    catch (error) {
        console.error("Error in category index:", error);
        res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const category = yield product_category_model_1.default.findOne({
            categorySlug: slug,
            deleted: false
        })
            .populate("categoryParentID", "categoryName categorySlug")
            .populate("createBy.staffID", "staffName")
            .populate("updateBy.staffID", "staffName")
            .populate("deleteBy.staffID", "staffName")
            .select("-__v");
        if (!category) {
            return res.status(404).json({
                code: 404,
                message: "Category not found"
            });
        }
        return res.status(200).json({
            code: 200,
            message: "Category detail",
            info: category
        });
    }
    catch (error) {
        console.error("Error in get category detail:", error);
        return res.status(500).json({
            code: 500,
            message: "Server error"
        });
    }
});
exports.detail = detail;
const buildCategoryTree = (categories, parentId = null) => {
    return categories
        .filter(cat => String(cat.categoryParentID) === String(parentId))
        .map(cat => (Object.assign(Object.assign({}, cat), { children: buildCategoryTree(categories, cat._id) })));
};
const categoryTrees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield product_category_model_1.default.find({
            deleted: false,
        })
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
exports.categoryTrees = categoryTrees;
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryName, categoryStatus, categoryPosition, categorySlug, categoryParentID } = req.body;
        const infoStaff = req["infoStaff"];
        if (!categoryName) {
            return res.status(400).json({ message: "Missing required field: categoryName" });
        }
        let finalSlug = (categorySlug === null || categorySlug === void 0 ? void 0 : categorySlug.trim()) || (0, slugify_1.default)(categoryName, { lower: true, strict: true });
        const existing = yield product_category_model_1.default.findOne({ categorySlug: finalSlug, deleted: false });
        if (existing) {
            return res.status(400).json({ message: "Slug already exists" });
        }
        let categoryImageUrl = "";
        if (req.file) {
            const uploadResult = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "categories");
            categoryImageUrl = uploadResult;
        }
        const newCategory = new product_category_model_1.default({
            categoryName,
            categorySlug: finalSlug,
            categoryStatus: categoryStatus || "active",
            categoryPosition: categoryPosition || 0,
            categoryParentID: categoryParentID || null,
            categoryImage: categoryImageUrl,
            createBy: {
                staffID: infoStaff._id,
                date: new Date()
            },
            updateBy: []
        });
        yield newCategory.save();
        return res.status(201).json({
            code: 201,
            message: "Category created successfully",
            info: newCategory
        });
    }
    catch (err) {
        console.error("Error adding category:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.addCategory = addCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { categoryName, categoryStatus, categoryPosition, categorySlug, categoryParentID } = req.body;
        const infoStaff = req["infoStaff"];
        const category = yield product_category_model_1.default.findOne({ _id: id, deleted: false });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        if (categoryParentID && categoryParentID === id) {
            return res.status(400).json({ message: "A category cannot be its own parent" });
        }
        if (categorySlug) {
            const slugExists = yield product_category_model_1.default.findOne({
                categorySlug,
                deleted: false,
                _id: { $ne: id }
            });
            if (slugExists) {
                return res.status(400).json({ message: "Slug already exists" });
            }
        }
        let categoryImageUrl = category.categoryImage;
        if (req.file) {
            const uploadResult = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "categories");
            categoryImageUrl = uploadResult;
        }
        if (categoryName !== undefined)
            category.categoryName = categoryName;
        if (categoryStatus !== undefined)
            category.categoryStatus = categoryStatus;
        if (categoryPosition !== undefined)
            category.categoryPosition = categoryPosition;
        if (categorySlug !== undefined)
            category.categorySlug = categorySlug;
        if (categoryParentID !== undefined)
            category.categoryParentID = categoryParentID;
        category.categoryImage = categoryImageUrl;
        if (!Array.isArray(category.updateBy)) {
            category.updateBy = [];
        }
        category.updateBy.push({
            staffID: infoStaff._id,
            date: new Date()
        });
        yield category.save();
        return res.status(200).json({
            code: 200,
            message: "Category updated successfully"
        });
    }
    catch (err) {
        console.error("Error updating category:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const infoStaff = req["infoStaff"];
        const category = yield product_category_model_1.default.findOne({ _id: id, deleted: false });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const products = yield product_model_1.default.find({ categoryID: id, deleted: false });
        if (products.length > 0) {
            return res.status(400).json({
                message: "Cannot delete category. There are products linked to this category."
            });
        }
        category.deleted = true;
        category.deletedAt = new Date();
        category.deleteBy = {
            staffID: infoStaff._id,
            date: new Date()
        };
        yield category.save();
        return res.status(200).json({
            code: 200,
            message: "Category deleted successfully"
        });
    }
    catch (err) {
        console.error("Error deleting category:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteCategory = deleteCategory;
