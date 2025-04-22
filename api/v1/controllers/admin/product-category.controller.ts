import { Request, Response } from "express";
import ProductCategory from "../../models/product-category.model";

// [GET] /products-category
export const index = async (req: Request, res: Response) => {
  const productscategory = await ProductCategory.find({
    deleted: false
  })
  .sort({ position: "desc" });

  try {
    res.json({
      code: 200,
      message: "All products-category",
      info: productscategory,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error",
    });
  }
};

// GET /products-category/categorytree
const buildCategoryTree = (categories: any[], parentId: any = null) => {
  return categories
    .filter(cat => String(cat.categoryParentID) === String(parentId))
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat._id),
    }));
};

export const categoryTrees = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await ProductCategory.find({
      deleted: false,
    })
      .sort({ categoryPosition: -1 })
      .lean(); 

    const categoryTree = buildCategoryTree(categories);

    res.status(200).json({
      code: 200,
      message: "All products-category (tree format)",
      info: categoryTree,
    });
  } catch (error) {
    console.error("Error building category tree:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};