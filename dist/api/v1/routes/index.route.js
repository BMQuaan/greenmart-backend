"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_route_1 = require("./task.route");
const user_route_1 = require("./user.route");
const product_route_1 = require("./product.route");
const product_category_route_1 = require("./product-category.route");
const mainV1Routes = (app) => {
    const version = "/api/v1";
    app.use(version + "/tasks", task_route_1.taskRoutes);
    app.use(version + "/users", user_route_1.userRoutes);
    app.use(version + "/products", product_route_1.productRoutes);
    app.use(version + "/products-category", product_category_route_1.productcategoryRoutes);
};
exports.default = mainV1Routes;
