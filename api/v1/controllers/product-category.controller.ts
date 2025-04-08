import { Request, Response } from "express";
import ProductCategory from "../../v1/models/product-category.model";

// [GET] /products-category
export const index = async (req: Request, res: Response): Promise<void> => {
  const productscategory = await ProductCategory.find({
    categoryStatus: "active",
    deleted: false
  }).sort({ position: "desc" });


  req["productscategory"] = productscategory;

  try {
    res.json({
      code: 200,
      message: "All products-category",
      info: req["productscategory"],
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error",
    });
  }
};