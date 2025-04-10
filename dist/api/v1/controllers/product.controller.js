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
exports.detail = exports.category = exports.index = void 0;
const product_model_1 = __importDefault(require("../../v1/models/product.model"));
const product_category_model_1 = __importDefault(require("../../v1/models/product-category.model"));
const productsHelper = __importStar(require("../../../helper/products"));
const pagination_1 = require("../../../helper/pagination");
const search_1 = require("../../../helper/search");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectSearch = (0, search_1.SearchHelper)(req.query);
        const find = {
            deleted: false,
            productStatus: "active",
        };
        if (req.query.keyword) {
            find.productName = objectSearch.regex;
        }
        const initPagination = {
            currentPage: 1,
            limitItems: 10,
        };
        const countProducts = yield product_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.paginationHelper)(initPagination, req.query, countProducts);
        objectPagination.totalItem = countProducts;
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue;
        }
        else {
            sort.productPosition = "desc";
        }
        const products = yield product_model_1.default.find(find)
            .sort(sort)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        let newProducts = productsHelper.priceNewProducts(products);
        if (req.query.sortKey === "productPrice" && req.query.sortValue) {
            const direction = req.query.sortValue === "asc" ? 1 : -1;
            newProducts = newProducts.sort((a, b) => {
                const aPrice = parseFloat(a.priceNew || "0");
                const bPrice = parseFloat(b.priceNew || "0");
                return (aPrice - bPrice) * direction;
            });
        }
        res.json({
            code: 200,
            message: "Danh sách sản phẩm",
            info: newProducts,
            pagination: objectPagination,
        });
    }
    catch (error) {
        console.error("Error in product index:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi server",
        });
    }
});
exports.index = index;
const category = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slugCategory } = req.params;
        const category = yield product_category_model_1.default.findOne({
            categorySlug: slugCategory,
            deleted: false,
            categoryStatus: "active",
        });
        if (!category) {
            res.status(404).json({
                code: 404,
                message: "Category not found",
            });
        }
        const getSubCategoryIds = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
            const subs = yield product_category_model_1.default.find({
                categoryParentID: parentId,
                categoryStatus: "active",
                deleted: false,
            });
            let ids = subs.map(sub => sub.id);
            for (const sub of subs) {
                const childIds = yield getSubCategoryIds(sub.id);
                ids = ids.concat(childIds);
            }
            return ids;
        });
        const subCategoryIds = yield getSubCategoryIds(category.id);
        const allCategoryIds = [category.id, ...subCategoryIds];
        const find = {
            categoryID: { $in: allCategoryIds },
            productStatus: "active",
            deleted: false,
        };
        const initPagination = {
            currentPage: 1,
            limitItems: 10,
        };
        const countProducts = yield product_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.paginationHelper)(initPagination, req.query, countProducts);
        objectPagination.totalItem = countProducts;
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue;
        }
        else {
            sort.productPosition = "desc";
        }
        const products = yield product_model_1.default.find(find)
            .sort(sort)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        let newProducts = productsHelper.priceNewProducts(products);
        if (req.query.sortKey === "productPrice" && req.query.sortValue) {
            const direction = req.query.sortValue === "asc" ? 1 : -1;
            newProducts = newProducts.sort((a, b) => {
                const aPrice = parseFloat(a.priceNew || "0");
                const bPrice = parseFloat(b.priceNew || "0");
                return (aPrice - bPrice) * direction;
            });
        }
        res.json({
            code: 200,
            message: `Products in category ${category.categoryName}`,
            info: newProducts,
            pagination: objectPagination,
        });
    }
    catch (error) {
        console.error("Error in category:", error);
        res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.category = category;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slugProduct;
        const product = yield product_model_1.default.findOne({
            productSlug: slug,
            deleted: false,
            productStatus: "active"
        });
        if (!product) {
            res.json({
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
            });
            if (category) {
                productObj.category = category;
            }
        }
        productObj.priceNew = productsHelper.priceNewProduct(product);
        res.json({
            code: 200,
            message: "Product detail",
            info: productObj
        });
        return;
    }
    catch (error) {
        console.error("Error in detail:", error);
        res.json({
            code: 500,
            message: "Internal Server Error",
        });
        return;
    }
});
exports.detail = detail;
