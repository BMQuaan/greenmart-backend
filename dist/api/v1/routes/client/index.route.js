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
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = require("./user.route");
const product_route_1 = require("./product.route");
const product_category_route_1 = require("./product-category.route");
const wishlist_route_1 = require("./wishlist.route");
const cart_route_1 = require("./cart.route");
const order_route_1 = require("./order.route");
const authMiddleware = __importStar(require("../../middlewares/client/auth.middleware"));
const clientV1Routes = (app) => {
    const version = "/api/v1";
    app.use(version + "/users", user_route_1.userRoutes);
    app.use(version + "/products", product_route_1.productRoutes);
    app.use(version + "/products-category", product_category_route_1.productcategoryRoutes);
    app.use(version + "/wishlist", authMiddleware.authenticateToken, wishlist_route_1.wishlistRoutes);
    app.use(version + "/cart", authMiddleware.authenticateToken, cart_route_1.cartRoutes);
    app.use(version + "/orders", authMiddleware.authenticateToken, order_route_1.orderRoutes);
};
exports.default = clientV1Routes;
