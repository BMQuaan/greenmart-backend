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
exports.cancelOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../../models/order.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const search_1 = require("../../../../helper/search");
const mongoose_1 = __importDefault(require("mongoose"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = req["infoUser"];
        const { customerInfor, orderItemList, orderPaymentMethod, } = req.body;
        if (!Array.isArray(orderItemList) || orderItemList.length === 0) {
            return res.status(400).json({ message: "Order must include at least one item" });
        }
        if (!(customerInfor === null || customerInfor === void 0 ? void 0 : customerInfor.name) || !(customerInfor === null || customerInfor === void 0 ? void 0 : customerInfor.address) || !(customerInfor === null || customerInfor === void 0 ? void 0 : customerInfor.phone)) {
            return res.status(400).json({ message: "Missing customer information" });
        }
        for (const item of orderItemList) {
            const product = yield product_model_1.default.findById(item.productID).session(session);
            if (!product || product.deleted || product.productStatus !== "active") {
                yield session.abortTransaction();
                return res.status(400).json({
                    message: `Product is not available!`,
                });
            }
            if (product.productStock < item.quantity) {
                yield session.abortTransaction();
                return res.status(400).json({
                    message: `Not enough stock for product "${product.productName}". Only ${product.productStock} left.`,
                });
            }
            product.productStock -= item.quantity;
            yield product.save({ session });
        }
        const newOrder = new order_model_1.default({
            customerID: user._id,
            customerInfor,
            orderItemList,
            orderPaymentMethod,
        });
        const savedOrder = yield newOrder.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            code: 200,
            message: "Order created successfully",
            data: savedOrder,
        });
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        console.error("Error creating order:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createOrder = createOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req["infoUser"];
        const objectSearch = (0, search_1.SearchHelper)(req.query);
        const filter = { customerID: user._id };
        if (req.query.status && ["pending", "cancel", "success"].includes(req.query.status.toString())) {
            filter.orderStatus = req.query.status.toString();
        }
        let orders = yield order_model_1.default.find(filter)
            .populate({
            path: "orderItemList.productID",
            select: "productName productImage",
        })
            .lean();
        if (objectSearch.keyword) {
            orders = orders.filter(order => order.orderItemList.some(item => { var _a, _b; return (_b = (_a = item.productID) === null || _a === void 0 ? void 0 : _a.productName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(objectSearch.keyword.toLowerCase()); }));
        }
        const updatedOrders = orders.map(order => {
            const totalOrderAmount = order.orderItemList.reduce((acc, item) => {
                const priceAfterDiscount = item.productPrice * (1 - (item.productDiscountPercentage || 0) / 100);
                return acc + (priceAfterDiscount * item.quantity);
            }, 0);
            return Object.assign(Object.assign({}, order), { totalOrderAmount });
        });
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey.toString()] = req.query.sortValue === "asc" ? 1 : -1;
        }
        else {
            sort.createdAt = -1;
        }
        updatedOrders.sort((a, b) => {
            if (req.query.sortKey === "totalOrderAmount") {
                return (a.totalOrderAmount - b.totalOrderAmount) * (sort.totalOrderAmount || -1);
            }
            else {
                return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * (sort.createdAt || -1);
            }
        });
        return res.status(200).json({
            code: 200,
            message: "User's Orders List",
            info: updatedOrders,
        });
    }
    catch (error) {
        console.error("Error in getOrders:", error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
});
exports.getOrders = getOrders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const user = req["infoUser"];
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }
        const order = yield order_model_1.default.findOne({ _id: id, customerID: user._id })
            .populate("customerID", "userName")
            .populate("orderItemList.productID", "productName productImage")
            .lean();
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
            orderPaymentMethod: order.orderPaymentMethod,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error getting order by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getOrderById = getOrderById;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req["infoUser"];
        const orderID = req.params.id;
        const order = yield order_model_1.default.findOne({
            _id: orderID,
            customerID: user._id,
        });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.orderStatus !== "pending") {
            return res.status(400).json({ message: "Only pending orders can be canceled" });
        }
        for (const item of order.orderItemList) {
            yield product_model_1.default.findByIdAndUpdate(item.productID, {
                $inc: { productStock: item.quantity }
            });
        }
        order.orderStatus = "cancel";
        yield order.save();
        return res.status(200).json({
            code: 200,
            message: "Order canceled successfully",
        });
    }
    catch (error) {
        console.error("Error canceling order:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.cancelOrder = cancelOrder;
