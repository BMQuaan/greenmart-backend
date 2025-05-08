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
      Product.countDocuments(),
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