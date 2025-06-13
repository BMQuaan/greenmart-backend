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
exports.clear = exports.deleteItem = exports.addPost = exports.index = void 0;
const wishlist_model_1 = __importDefault(require("../../models/wishlist.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const mongoose_1 = __importStar(require("mongoose"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req["infoUser"]._id;
        let wishlist = yield wishlist_model_1.default.findOne({ userID }).populate({
            path: "wishListItemList.productID",
            match: { deleted: false, productStatus: "active" },
            select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
        });
        if (!wishlist) {
            wishlist = new wishlist_model_1.default({ userID, wishListItemList: [] });
            yield wishlist.save();
        }
        const validItems = wishlist.wishListItemList.filter(item => item.productID !== null);
        return res.status(200).json({
            message: validItems.length === 0 ? "Wishlist is empty" : "Wishlist fetched successfully",
            data: validItems,
        });
    }
    catch (err) {
        console.error("Get wishlist error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.index = index;
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req["infoUser"]._id;
        const { productID } = req.body;
        if (!productID || !mongoose_1.default.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid product" });
        }
        const product = yield product_model_1.default.findById(productID);
        if (!product || product.deleted || product.productStatus === "inactive") {
            return res.status(404).json({ message: "Product not found or inactive" });
        }
        let wishlist = yield wishlist_model_1.default.findOne({ userID: userID });
        if (!wishlist) {
            wishlist = new wishlist_model_1.default({
                userID,
                wishListItemList: [{ productID: new mongoose_1.Types.ObjectId(productID) }],
            });
        }
        else {
            const alreadyExists = wishlist.wishListItemList.some((item) => item.productID.toString() === productID);
            if (alreadyExists) {
                return res.status(400).json({ message: "Product already in wishlist" });
            }
            wishlist.wishListItemList.push({ productID: new mongoose_1.default.Types.ObjectId(productID) });
        }
        yield wishlist.save();
        yield wishlist.populate({
            path: "wishListItemList.productID",
            match: { deleted: false, productStatus: "active" },
            select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
        });
        const validItems = wishlist.wishListItemList.filter((item) => item.productID !== null);
        return res.status(200).json({ message: "Product added to wishlist", data: validItems });
    }
    catch (err) {
        console.error("Add to wishlist error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.addPost = addPost;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req["infoUser"]._id;
        const { productID } = req.body;
        if (!productID || !mongoose_1.default.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: "Invalid product" });
        }
        const wishlist = yield wishlist_model_1.default.findOne({ userID: userID });
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }
        const index = wishlist.wishListItemList.findIndex((item) => item.productID.toString() === productID);
        if (index === -1) {
            return res.status(404).json({ message: "Product not in wishlist" });
        }
        wishlist.wishListItemList.splice(index, 1);
        yield wishlist.save();
        yield wishlist.populate({
            path: "wishListItemList.productID",
            match: { deleted: false, productStatus: "active" },
            select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
        });
        const validItems = wishlist.wishListItemList.filter((item) => item.productID !== null);
        return res.status(200).json({ message: "Product removed from wishlist", data: validItems });
    }
    catch (err) {
        console.error("Delete wishlist item error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.deleteItem = deleteItem;
const clear = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req["infoUser"]._id;
        const wishlist = yield wishlist_model_1.default.findOne({ userID: userID });
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }
        wishlist.wishListItemList = [];
        yield wishlist.save();
        return res.status(200).json({ message: "Wishlist cleared successfully", data: [] });
    }
    catch (err) {
        console.error("Clear wishlist error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.clear = clear;
