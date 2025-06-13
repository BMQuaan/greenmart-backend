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
exports.deleteItem = exports.updateItem = exports.addItem = exports.detail = exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const product_category_model_1 = __importDefault(require("../../models/product-category.model"));
const productsHelper = __importStar(require("../../../../helper/products"));
const search_1 = require("../../../../helper/search");
const uploadCloudinary_1 = require("../../../../helper/uploadCloudinary");
const slugify_1 = __importDefault(require("slugify"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectSearch = (0, search_1.SearchHelper)(req.query);
        const find = {
            deleted: false,
        };
        if (req.query.keyword) {
            find.productName = objectSearch.regex;
        }
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue;
        }
        else {
            sort.productPosition = "desc";
        }
        const products = yield product_model_1.default.find(find)
            .sort(sort);
        let newProducts = productsHelper.priceNewProducts(products);
        if (req.query.sortKey === "productPrice" && req.query.sortValue) {
            const direction = req.query.sortValue === "asc" ? 1 : -1;
            newProducts = newProducts.sort((a, b) => {
                const aPrice = parseFloat(a.priceNew || "0");
                const bPrice = parseFloat(b.priceNew || "0");
                return (aPrice - bPrice) * direction;
            });
        }
        res.status(200).json({
            code: 200,
            message: "Products List",
            info: newProducts,
        });
    }
    catch (error) {
        console.error("Error in product index:", error);
        res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slugProduct;
        const product = yield product_model_1.default.findOne({
            productSlug: slug,
            deleted: false,
        })
            .populate("createBy.staffID", "staffName")
            .populate("updateBy.staffID", "staffName")
            .populate("deleteBy.staffID", "staffName")
            .select("-__v");
        if (!product) {
            res.status(404).json({
                code: 404,
                message: "Product not found",
            });
            return;
        }
        const productObj = product.toObject();
        if (productObj.categoryID) {
            const category = yield product_category_model_1.default.findOne({
                _id: productObj.categoryID,
                deleted: false,
                categoryStatus: "active"
            }).select("_id categoryName categorySlug categoryImage categoryParentID");
            if (category) {
                productObj.category = category;
            }
        }
        productObj.priceNew = productsHelper.priceNewProduct(product);
        res.status(200).json({
            code: 200,
            message: "Product detail",
            info: productObj
        });
        return;
    }
    catch (error) {
        console.error("Error in detail:", error);
        res.status(500).json({
            code: 500,
            message: "Internal Server Error",
        });
        return;
    }
});
exports.detail = detail;
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productName, productPrice, productStock, productDescription, productStatus, productPosition, productDiscountPercentage, categoryID, productSlug } = req.body;
        const infoStaff = req["infoStaff"];
        if (!productName || !productPrice || !categoryID) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        let productImageUrl = "";
        if (req.file) {
            const uploadResult = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "products");
            productImageUrl = uploadResult;
        }
        let finalSlug = productSlug === null || productSlug === void 0 ? void 0 : productSlug.trim();
        if (!finalSlug) {
            finalSlug = (0, slugify_1.default)(productName, { lower: true, strict: true });
        }
        const existing = yield product_model_1.default.findOne({ productSlug: finalSlug, deleted: false });
        if (existing) {
            return res.status(400).json({ message: "Slug already exists. Please choose a different one." });
        }
        const newProduct = new product_model_1.default({
            productName,
            productSlug: finalSlug,
            productPrice,
            productStock: productStock || 0,
            productDescription,
            productStatus: productStatus || "active",
            productPosition: productPosition || 0,
            productDiscountPercentage: productDiscountPercentage || 0,
            productImage: productImageUrl,
            categoryID,
            createBy: {
                staffID: infoStaff._id,
                date: new Date()
            }
        });
        yield newProduct.save();
        return res.status(201).json({
            code: 201,
            message: "Product created successfully",
            info: newProduct
        });
    }
    catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.addItem = addItem;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { productName, productPrice, productStock, productDescription, productStatus, productPosition, productDiscountPercentage, categoryID, productSlug } = req.body;
        const infoStaff = req["infoStaff"];
        const product = yield product_model_1.default.findOne({ _id: id, deleted: false });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        let productImageUrl = product.productImage;
        if (req.file) {
            const uploadResult = yield (0, uploadCloudinary_1.uploadImageToCloudinary)(req.file.buffer, "products");
            productImageUrl = uploadResult;
        }
        product.productImage = productImageUrl;
        if (productSlug && productSlug !== product.productSlug) {
            const slugExist = yield product_model_1.default.findOne({ productSlug, _id: { $ne: id }, deleted: false });
            if (slugExist) {
                return res.status(400).json({ message: "Slug already exists. Please choose a different one." });
            }
            if (productSlug !== undefined)
                product.productSlug = productSlug;
        }
        if (productName !== undefined)
            product.productName = productName;
        if (productPrice !== undefined)
            product.productPrice = productPrice;
        if (productStock !== undefined)
            product.productStock = productStock;
        if (productDescription !== undefined)
            product.productDescription = productDescription;
        if (productStatus !== undefined)
            product.productStatus = productStatus;
        if (productPosition !== undefined)
            product.productPosition = productPosition;
        if (productDiscountPercentage !== undefined)
            product.productDiscountPercentage = productDiscountPercentage;
        if (categoryID !== undefined)
            product.categoryID = categoryID;
        product.updateBy.push({
            staffID: infoStaff._id,
            date: new Date()
        });
        yield product.save();
        return res.status(200).json({
            code: 200,
            message: "Product updated successfully",
        });
    }
    catch (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateItem = updateItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const infoStaff = req["infoStaff"];
        const product = yield product_model_1.default.findOne({ _id: id, deleted: false });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        product.deleted = true;
        product.deletedAt = new Date();
        product.deleteBy = {
            staffID: infoStaff._id,
            date: new Date()
        };
        yield product.save();
        return res.status(200).json({
            code: 200,
            message: "Product deleted successfully"
        });
    }
    catch (err) {
        console.error("Error deleting product:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteItem = deleteItem;
