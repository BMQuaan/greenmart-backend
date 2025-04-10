"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceNewProduct = exports.priceNewProducts = void 0;
const priceNewProducts = (products) => {
    return products.map((item) => {
        const rawPrice = (item.productPrice * (100 - item.productDiscountPercentage)) / 100;
        const priceNew = Number(rawPrice.toFixed(2));
        return Object.assign(Object.assign({}, item.toObject()), { priceNew });
    });
};
exports.priceNewProducts = priceNewProducts;
const priceNewProduct = (product) => {
    const rawPrice = (product.productPrice * (100 - product.productDiscountPercentage)) / 100;
    const priceNew = Number(rawPrice.toFixed(2));
    return priceNew.toString();
};
exports.priceNewProduct = priceNewProduct;
