import { Request, Response } from "express";
import ProductCategory from "../../models/product-category.model";
import { SearchHelper } from "../../../../helper/search";

// [GET] /productcategories
export const index = async (req: Request, res: Response) => {
  try {
    interface IProductCategoryFind {
      deleted: boolean;
      categoryName?: RegExp;
    }

    const objectSearch = SearchHelper(req.query);

    const find: IProductCategoryFind = {
      deleted: false,
    };

    if (req.query.keyword) {
      find.categoryName = objectSearch.regex;
    }

    const sort: Record<string, any> = {};

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue;
    } else {
      sort.position = "desc"; 
    }

    const productCategories = await ProductCategory.find(find).sort(sort);

    res.json({
      code: 200,
      message: "All product categories",
      info: productCategories,
    });
  } catch (error) {
    console.error("Error in category index:", error);
    res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};


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