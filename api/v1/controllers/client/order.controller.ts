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
      promotionID,
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

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${item.productID}` });
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
      promotionID: promotionID || null,
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

    let orders = await OrderModel.find({ customerID: user._id })
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