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
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find();
    const newProducts = productsHelper.priceNewProducts(products);
    try {
        res.json({
            code: 200,
            message: "All product",
            info: newProducts,
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Error",
        });
    }
});
exports.index = index;
const category = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slugCategory = req.params.slugCategory;
    const category = yield product_category_model_1.default.findOne({
        slug: slugCategory,
        deleted: false,
        status: "active",
    });
    if (!category) {
        return res.redirect("/");
    }
    const getSubCategory = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
        const subs = yield product_category_model_1.default.find({
            parent_id: parentId,
            status: "active",
            deleted: false,
        });
        let allSub = [...subs];
        for (const sub of subs) {
            const childs = yield getSubCategory(sub.id);
            allSub = allSub.concat(childs);
        }
        return allSub;
    });
    const listSubCategory = yield getSubCategory(category.id);
    const listSubCategoryId = listSubCategory.map(item => item.id);
    const products = yield product_model_1.default.find({
        product_category_id: { $in: [category.id, ...listSubCategoryId] },
        status: "active",
        deleted: false
    }).sort({ position: "desc" });
    const newProducts = productsHelper.priceNewProducts(products);
    res.render("client/pages/products/index", {
        pageTitle: category.categoryName,
        products: newProducts
    });
});
exports.category = category;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slugProduct;
        const product = yield product_model_1.default.findOne({
            slug,
            deleted: false,
            status: "active"
        });
        if (!product)
            return res.redirect("/");
        if (product.id) {
            const category = yield product_category_model_1.default.findOne({
                _id: product.id,
                deleted: false,
                status: "active"
            });
            if (category) {
                product.category = category;
            }
        }
        product.priceNew = productsHelper.priceNewProduct(product);
        res.render("client/pages/products/detail", {
            pageTitle: "Chi tiết sản phẩm",
            product
        });
    }
    catch (error) {
        res.redirect("/");
    }
});
exports.detail = detail;
