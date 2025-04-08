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
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productscategory = yield product_category_model_1.default.find({
        categoryStatus: "active",
        deleted: false
    }).sort({ position: "desc" });
    req["productscategory"] = productscategory;
    try {
        res.json({
            code: 200,
            message: "All products-category",
            info: req["productscategory"],
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
