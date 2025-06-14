import { Request, Response } from "express";
import OrderModel from "../../models/order.model";
import Product from "../../models/product.model";
import mongoose from "mongoose";

// GET /api/orders 
export const index = async (req: Request, res: Response) => {
  try {
    const { status, keyword } = req.query;

    const filter: any = {};
    if (status) {
      const allowedStatus = ["pending", "success", "cancel"];
      if (!allowedStatus.includes(status as string)) {
        return res.status(400).json({ message: "Invalid order status filter" });
      }
      filter.orderStatus = status;
    }

    const orders = await OrderModel.find(filter)
      .populate("customerID", "userName")
      .sort({ createdAt: -1 });

    const filteredOrders = keyword
      ? orders.filter(order => {
          const orderIdMatch = order._id.toString().includes(keyword.toString().toLowerCase());

          const customer = order.customerID as { userName?: string };
          const userName = customer?.userName || "";

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
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET /api/orders/:id 
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await OrderModel.findById(id)
      .populate("customerID", "userName")
      .populate("orderItemList.productID", "productName productImage")
      .populate("updateBy.staffID", "staffName");

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
        orderPaymentMethod: order.orderPaymentMethod
    };


    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/orders/:id/status 
export const updateOrderStatus = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const validStatuses = ["success", "pending", "cancel"];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await OrderModel.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Only orders with 'pending' status can be updated" });
    }

    if (orderStatus === "cancel") {
      for (const item of order.orderItemList) {
        const product = await Product.findById(item.productID).session(session);

        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({ message: `Product not found: ${item.productID}` });
        }

        product.productStock += item.quantity;
        await product.save({ session });
      }
    }

    // Cập nhật trạng thái đơn hàng
    order.orderStatus = orderStatus;
    order.updateBy = {
      staffID: req["infoStaff"]._id,
      date: new Date(),
    };

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

