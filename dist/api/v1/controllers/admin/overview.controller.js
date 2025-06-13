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
exports.getTodayOrders = exports.getOrderStatistics = exports.getTotalCounts = exports.getCategoryProductCount = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const product_category_model_1 = __importDefault(require("../../models/product-category.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const order_model_1 = __importDefault(require("../../models/order.model"));
const getCategoryProductCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield product_category_model_1.default.find({ deleted: false }).lean();
        const productCounts = yield product_model_1.default.aggregate([
            { $match: { deleted: false } },
            { $group: { _id: "$categoryID", count: { $sum: 1 } } }
        ]);
        const countMap = new Map();
        for (const item of productCounts) {
            countMap.set(item._id.toString(), item.count);
        }
        for (const cat of categories) {
            const catId = cat._id.toString();
            const count = countMap.get(catId) || 0;
            if (cat.categoryParentID) {
                const parentId = cat.categoryParentID.toString();
                countMap.set(parentId, (countMap.get(parentId) || 0) + count);
            }
        }
        const result = categories.map(cat => ({
            _id: cat._id,
            categoryName: cat.categoryName,
            categoryImage: cat.categoryImage || "",
            productCount: countMap.get(cat._id.toString()) || 0
        }));
        return res.status(200).json({
            message: "Successfully retrieved category product count (with parent aggregation)",
            data: result
        });
    }
    catch (error) {
        console.error("getCategoryProductCount error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.getCategoryProductCount = getCategoryProductCount;
const getTotalCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, totalProducts, totalOrders] = yield Promise.all([
            user_model_1.default.countDocuments({ deleted: false }),
            product_model_1.default.countDocuments({ deleted: false }),
            order_model_1.default.countDocuments()
        ]);
        return res.status(200).json({
            code: 200,
            message: "Total counts retrieved successfully",
            data: {
                totalUsers,
                totalProducts,
                totalOrders
            }
        });
    }
    catch (error) {
        console.error("Error in getTotalCounts:", error);
        return res.status(500).json({
            code: 500,
            message: "Internal server error"
        });
    }
});
exports.getTotalCounts = getTotalCounts;
const getOrderStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({ message: "Missing 'from' or 'to' date" });
        }
        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ message: "Invalid 'from' or 'to' date format" });
        }
        if (fromDate > toDate) {
            return res.status(400).json({ message: "'from' date must be earlier than 'to' date" });
        }
        const orders = yield order_model_1.default.find({
            createdAt: { $gte: fromDate, $lte: toDate },
            orderStatus: "success"
        }).lean();
        let totalOrders = orders.length;
        let totalRevenue = 0;
        for (const order of orders) {
            for (const item of order.orderItemList) {
                const price = item.productPrice;
                const discount = item.productDiscountPercentage || 0;
                const quantity = item.quantity;
                const itemTotal = price * quantity * (1 - discount / 100);
                totalRevenue += itemTotal;
            }
        }
        totalRevenue = parseFloat(totalRevenue.toFixed(2));
        return res.status(200).json({
            code: 200,
            message: "Order statistics",
            info: {
                totalOrders,
                totalRevenue
            }
        });
    }
    catch (error) {
        console.error("Error getting order statistics:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getOrderStatistics = getOrderStatistics;
const getTodayOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const filter = {
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        };
        if (status) {
            const allowedStatus = ["pending", "success", "cancel"];
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({ message: "Invalid order status filter" });
            }
            filter.orderStatus = status;
        }
        const orders = yield order_model_1.default.find(filter)
            .populate("customerID", "userName")
            .sort({ createdAt: -1 });
        const formattedOrders = orders.map(order => {
            const totalAmount = order.orderItemList.reduce((total, item) => {
                const price = item.productPrice;
                const discount = item.productDiscountPercentage || 0;
                const quantity = item.quantity;
                const discountedPrice = price * (1 - discount / 100);
                return total + discountedPrice * quantity;
            }, 0);
            return {
                _id: order._id,
                customerName: order.customerID && typeof order.customerID === "object"
                    ? order.customerID["userName"]
                    : "Unknown",
                createdAt: order.createdAt,
                orderStatus: order.orderStatus,
                totalAmount: parseFloat(totalAmount.toFixed(2)),
            };
        });
        res.status(200).json(formattedOrders);
    }
    catch (error) {
        console.error("Error getting today's orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getTodayOrders = getTodayOrders;
