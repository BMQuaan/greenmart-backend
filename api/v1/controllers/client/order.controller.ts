import { Request, Response } from "express";
import OrderModel from "../../models/order.model";
import Product from "../../models/product.model";
import { SearchHelper } from "../../../../helper/search";
import mongoose from "mongoose";

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req["infoUser"];

    const {
      customerInfor,
      orderItemList,
      orderPaymentMethod,
    } = req.body;

    if (!Array.isArray(orderItemList) || orderItemList.length === 0) {
      return res.status(400).json({ message: "Order must include at least one item" });
    }

    if (!customerInfor?.name || !customerInfor?.address || !customerInfor?.phone) {
      return res.status(400).json({ message: "Missing customer information" });
    }

    // Check and update product stock
    for (const item of orderItemList) {
      const product = await Product.findById(item.productID).session(session);

      if (!product || product.deleted || product.productStatus !== "active") {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Product is not available!`,
        });
      }

      if (product.productStock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Not enough stock for product "${product.productName}". Only ${product.productStock} left.`,
        });
      }

      product.productStock -= item.quantity;
      await product.save({ session });
    }

    // Create order
    const newOrder = new OrderModel({
      customerID: user._id,
      customerInfor,
      orderItemList,
      orderPaymentMethod,
    });

    const savedOrder = await newOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      code: 200,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = req["infoUser"];
    const objectSearch = SearchHelper(req.query);

    const filter: any = { customerID: user._id };

    if (req.query.status && ["pending", "cancel", "success"].includes(req.query.status.toString())) {
      filter.orderStatus = req.query.status.toString();
    }

    let orders = await OrderModel.find(filter)
      .populate({
        path: "orderItemList.productID",
        select: "productName productImage",
      })
      .lean();

    if (objectSearch.keyword) {
      orders = orders.filter(order =>
        order.orderItemList.some(item =>
          (item.productID as any)?.productName?.toLowerCase().includes(objectSearch.keyword.toLowerCase())
        )
      );
    }

    const updatedOrders = orders.map(order => {
      const totalOrderAmount = order.orderItemList.reduce((acc, item) => {
        const priceAfterDiscount = item.productPrice * (1 - (item.productDiscountPercentage || 0) / 100);
        return acc + (priceAfterDiscount * item.quantity);
      }, 0);

      return {
        ...order,
        totalOrderAmount,
      };
    });

    const sort: Record<string, any> = {};

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1; 
    }

    updatedOrders.sort((a, b) => {
      if (req.query.sortKey === "totalOrderAmount") {
        return (a.totalOrderAmount - b.totalOrderAmount) * (sort.totalOrderAmount || -1);
      } else {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * (sort.createdAt || -1);
      }
    });

    return res.status(200).json({
      code: 200,
      message: "User's Orders List",
      info: updatedOrders,
    });
  } catch (error) {
    console.error("Error in getOrders:", error);
    return res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req["infoUser"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await OrderModel.findOne({ _id: id, customerID: user._id })
      .populate("customerID", "userName")
      .populate("orderItemList.productID", "productName productImage")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const products = order.orderItemList.map(item => {
      const product = item.productID as any;
      const price = item.productPrice;
      const discount = item.productDiscountPercentage || 0;
      const quantity = item.quantity;
      const discountedPrice = price * (1 - discount / 100);

      return {
        productName: product?.productName || "Unknown",
        productImage: product?.productImage || "",
        productPrice: parseFloat(discountedPrice.toFixed(2)),
        quantity,
      };
    });

    const totalAmount = products.reduce((sum, item) => {
      return sum + item.productPrice * item.quantity;
    }, 0);

    const response = {
      _id: order._id,
      customerID: order.customerID?._id,
      customerName: (order.customerID as any)?.userName || "Unknown",
      customerInfor: order.customerInfor,
      products,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      updatedBy: {
        staffID: order.updateBy?.staffID,
        date: order.updateBy?.date,
      },
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      orderPaymentMethod: order.orderPaymentMethod,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const user = req["infoUser"];
    const orderID = req.params.id;

     const order = await OrderModel.findOne({
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
      await Product.findByIdAndUpdate(item.productID, {
        $inc: { productStock: item.quantity }
      });
    }

    order.orderStatus = "cancel";
    await order.save();
    return res.status(200).json({
      code: 200,
      message: "Order canceled successfully",
    });
    } catch (error) {
      console.error("Error canceling order:", error);
      return res.status(500).json({ message: "Server error" });
    }
};
