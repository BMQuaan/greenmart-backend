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
exports.clearCart = exports.deleteFromCart = exports.updateQuantity = exports.addToCart = exports.index = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const cart_model_1 = __importDefault(require("../../models/cart.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req["infoUser"]._id;
        let cart = yield cart_model_1.default.findOne({ userID }).populate({
            path: "cartList.productID",
            match: { deleted: false, productStatus: "active" },
            select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
        });
        if (!cart) {
            cart = new cart_model_1.default({ userID, cartList: [] });
            yield cart.save();
        }
        return res.status(200).json({
            message: cart.cartList.length === 0 ? "Cart is empty" : "Cart fetched",
            data: cart.cartList.filter(item => item.productID !== null),
        });
    }
    catch (err) {
        console.error("Get cart error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.index = index;
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req["infoUser"]._id;
    const { productID, quantity } = req.body;
    if (!productID || !mongoose_1.default.Types.ObjectId.isValid(productID)) {
        return res.status(400).json({ message: "Invalid product" });
    }
    const productObjId = new mongoose_1.Types.ObjectId(productID);
    let cart = yield cart_model_1.default.findOne({ userID: userID });
    if (!cart) {
        cart = new cart_model_1.default({
            userID,
            cartList: [{ productID: productObjId, quantity: quantity || 1 }],
        });
    }
    else {
        const item = cart.cartList.find((item) => item.productID.equals(productObjId));
        if (item) {
            item.quantity += quantity || 1;
        }
        else {
            cart.cartList.push({ productID: productObjId, quantity: quantity || 1 });
        }
    }
    yield cart.save();
    yield cart.populate({
        path: "cartList.productID",
        match: { deleted: false, productStatus: "active" },
        select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });
    res.status(200).json({
        message: "Added to cart",
        data: cart.cartList.filter(item => item.productID !== null),
    });
});
exports.addToCart = addToCart;
const updateQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req["infoUser"]._id;
    const { productID, quantity } = req.body;
    if (!productID || !mongoose_1.default.Types.ObjectId.isValid(productID)) {
        return res.status(400).json({ message: "Invalid product" });
    }
    if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    const productObjId = new mongoose_1.Types.ObjectId(productID);
    const cart = yield cart_model_1.default.findOne({ userID: userID });
    if (!cart)
        return res.status(404).json({ message: "Cart not found" });
    const item = cart.cartList.find((item) => item.productID.equals(productObjId));
    if (!item)
        return res.status(404).json({ message: "Product not in cart" });
    item.quantity = quantity;
    yield cart.save();
    yield cart.populate({
        path: "cartList.productID",
        match: { deleted: false, productStatus: "active" },
        select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });
    res.status(200).json({
        message: "Quantity updated",
        data: cart.cartList.filter(item => item.productID !== null),
    });
});
exports.updateQuantity = updateQuantity;
const deleteFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req["infoUser"]._id;
    const { productID } = req.body;
    if (!productID || !mongoose_1.default.Types.ObjectId.isValid(productID)) {
        return res.status(400).json({ message: "Invalid product" });
    }
    const productObjId = new mongoose_1.Types.ObjectId(productID);
    const cart = yield cart_model_1.default.findOne({ userID: userID });
    if (!cart)
        return res.status(404).json({ message: "Cart not found" });
    cart.cartList = cart.cartList.filter((item) => !item.productID.equals(productObjId));
    yield cart.save();
    yield cart.populate({
        path: "cartList.productID",
        match: { deleted: false, productStatus: "active" },
        select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });
    res.status(200).json({
        message: "Product removed from cart",
        data: cart.cartList.filter(item => item.productID !== null),
    });
});
exports.deleteFromCart = deleteFromCart;
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req["infoUser"]._id;
    yield cart_model_1.default.findOneAndUpdate({ userID }, { cartList: [] });
    res.status(200).json({ message: "Cart cleared" });
});
exports.clearCart = clearCart;
