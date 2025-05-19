import Product from "../../models/product.model";
import ProductCategoryModel from "../../models/product-category.model";
import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import OrderModel from "../../models/order.model";

export const getCategoryProductCount = async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategoryModel.find({ deleted: false }).lean();

    const productCounts = await Product.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: "$categoryID", count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
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

  } catch (error) {
    console.error("getCategoryProductCount error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTotalCounts = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      UserModel.countDocuments({ deleted: false }),
      Product.countDocuments({ deleted: false }),
      OrderModel.countDocuments()
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
  } catch (error) {
    console.error("Error in getTotalCounts:", error);
    return res.status(500).json({
      code: 500,
      message: "Internal server error"
    });
  }
};

export const getOrderStatistics = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "Missing 'from' or 'to' date" });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);
    toDate.setHours(23, 59, 59, 999); 

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Invalid 'from' or 'to' date format" });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ message: "'from' date must be earlier than 'to' date" });
    }

    const orders = await OrderModel.find({
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
  } catch (error) {
    console.error("Error getting order statistics:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTodayOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const filter: any = {
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

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
  } catch (error) {
    console.error("Error getting today's orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
