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
exports.updateOrderStatus = exports.getOrderById = exports.index = void 0;
const order_model_1 = __importDefault(require("../../models/order.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, keyword } = req.query;
        const filter = {};
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
        const filteredOrders = keyword
            ? orders.filter(order => {
                const orderIdMatch = order._id.toString().includes(keyword.toString().toLowerCase());
                const customer = order.customerID;
                const userName = (customer === null || customer === void 0 ? void 0 : customer.userName) || "";
                const nameMatch = userName.toLowerCase().includes(keyword.toString().toLowerCase());
                return orderIdMatch || nameMatch;
            })
            : orders;
        const formattedOrders = filteredOrders.map(order => {
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
        console.error("Error getting orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.index = index;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }
        const order = yield order_model_1.default.findById(id)
            .populate("customerID", "userName")
            .populate("orderItemList.productID", "productName productImage")
            .populate("updateBy.staffID", "staffName");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const products = order.orderItemList.map(item => {
            const product = item.productID;
            const price = item.productPrice;
            const discount = item.productDiscountPercentage || 0;
            const quantity = item.quantity;
            const discountedPrice = price * (1 - discount / 100);
            return {
                productName: (product === null || product === void 0 ? void 0 : product.productName) || "Unknown",
                productImage: (product === null || product === void 0 ? void 0 : product.productImage) || "",
                productPrice: parseFloat(discountedPrice.toFixed(2)),
                quantity,
            };
        });
        const totalAmount = products.reduce((sum, item) => {
            return sum + item.productPrice * item.quantity;
        }, 0);
        const response = {
            _id: order._id,
            customerID: (_a = order.customerID) === null || _a === void 0 ? void 0 : _a._id,
            customerName: ((_b = order.customerID) === null || _b === void 0 ? void 0 : _b.userName) || "Unknown",
            customerInfor: order.customerInfor,
            products,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            updatedBy: {
                staffID: (_c = order.updateBy) === null || _c === void 0 ? void 0 : _c.staffID,
                date: (_d = order.updateBy) === null || _d === void 0 ? void 0 : _d.date,
            },
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            orderPaymentMethod: order.orderPaymentMethod
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error getting order by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getOrderById = getOrderById;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        const validStatuses = ["success", "pending", "cancel"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const order = yield order_model_1.default.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.orderStatus !== "pending") {
            return res.status(400).json({ message: "Only orders with 'pending' status can be updated" });
        }
        order.orderStatus = orderStatus;
        order.updateBy = {
            staffID: req["infoStaff"]._id,
            date: new Date(),
        };
        yield order.save();
        res.status(200).json({ message: "Order status updated successfully", order });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateOrderStatus = updateOrderStatus;
