import { Request, Response } from "express";
import ProductCategory from "../../models/product-category.model";

// [GET] /products-category
export const index = async (req: Request, res: Response) => {
  const productscategory = await ProductCategory.find({
    categoryStatus: "active",
    deleted: false
  })
  .select("_id categoryName categorySlug categoryImage categoryParentID")
  .sort({ position: "desc" });

  try {
    res.status(200).json({
      code: 200,
      message: "All products-category",
      info: productscategory,
    });
  } catch (error) {
    res.status(400).json({
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
      categoryStatus: "active",
      deleted: false,
    })
      .select("_id categoryName categorySlug categoryImage categoryParentID")
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

// GET /products-category/categorytree/:slugCategory
export const categoryTree = async (req: Request, res: Response) => {
  try {
    const { slugCategory } = req.params;

    const rootCategory = await ProductCategory.findOne({
      categorySlug: slugCategory,
      categoryStatus: "active",
      deleted: false,
    }).select("_id categoryName categorySlug categoryImage categoryParentID") .lean();

    if (!rootCategory) {
      res.status(404).json({
        code: 404,
        message: "Category not found",
      });
      return;
    }

    const categories = await ProductCategory.find({
      categoryStatus: "active",
      deleted: false,
    })
      .select("_id categoryName categorySlug categoryImage categoryParentID")
      .sort({ categoryPosition: -1 })
      .lean();

    const childrenTree = buildCategoryTree(categories, rootCategory._id);

    const result = {
      ...rootCategory,
      children: childrenTree,
    };

    res.status(200).json({
      code: 200,
      message: `Tree for category '${slugCategory}'`,
      info: result,
    });
  } catch (error) {
    console.error("Error building category tree by slug:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};
