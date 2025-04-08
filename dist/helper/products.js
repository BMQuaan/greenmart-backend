"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceNewProduct = exports.priceNewProducts = void 0;
const priceNewProducts = (products) => {
    return products.map((item) => {
        const priceNew = ((item.productPrice * (100 - item.productDiscountPercentage)) / 100).toFixed(0);
        return Object.assign(Object.assign({}, item.toObject()), { priceNew });
    });
};
exports.priceNewProducts = priceNewProducts;
const priceNewProduct = (product) => {
    const priceNew = ((product.productPrice * (100 - product.productDiscountPercentage)) / 100).toFixed(0);
    return priceNew;
};
exports.priceNewProduct = priceNewProduct;
