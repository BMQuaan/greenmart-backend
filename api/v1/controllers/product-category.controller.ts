import { Request, Response } from "express";
import ProductCategory from "../../v1/models/product-category.model";

// [GET] /products-category
// export const index = async (req: Request, res: Response): Promise<void> => {
//   const productscategory = await ProductCategory.find({
//     categoryStatus: "active",
//     deleted: false
//   }).sort({ position: "desc" });


//   req["productscategory"] = productscategory;

//   try {
//     res.json({
//       code: 200,
//       message: "All products-category",
//       info: req["productscategory"],
//     });
//   } catch (error) {
//     res.json({
//       code: 400,
//       message: "Error",
//     });
//   }
// };

const buildCategoryTree = (categories: any[], parentId: any = null): any[] => {
  return categories
    .filter(cat => String(cat.categoryParentID) === String(parentId))
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat._id),
    }));
};

export const index = async (req: Request, res: Response): Promise<void> => {
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