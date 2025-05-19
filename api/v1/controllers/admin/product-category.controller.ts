import { Request, Response } from "express";
import ProductCategory from "../../models/product-category.model";
import { SearchHelper } from "../../../../helper/search";
import { uploadImageToCloudinary } from "../../../../helper/uploadCloudinary";
import slugify from "slugify";
import Product from "../../models/product.model";

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

    res.status(200).json({
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

// [GET] /products-category/detail/:slug
export const detail = async (req: Request<{ slug: string }>, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await ProductCategory.findOne({
      categorySlug: slug,
      deleted: false
    })
    .populate("categoryParentID", "categoryName categorySlug")
    .populate("createBy.staffID", "staffName")
    .populate("updateBy.staffID", "staffName")
    .populate("deleteBy.staffID", "staffName")
    .select("-__v");

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Category detail",
      info: category
    });
  } catch (error) {
    console.error("Error in get category detail:", error);
    return res.status(500).json({
      code: 500,
      message: "Server error"
    });
  }
};

//
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

export const addCategory = async (req: Request, res: Response) => {
  try {
    const {
      categoryName,
      categoryStatus,
      categoryPosition,
      categorySlug,
      categoryParentID
    } = req.body;

    const infoStaff = req["infoStaff"];

    if (!categoryName) {
      return res.status(400).json({ message: "Missing required field: categoryName" });
    }

    let finalSlug = categorySlug?.trim() || slugify(categoryName, { lower: true, strict: true });

    const existing = await ProductCategory.findOne({ categorySlug: finalSlug, deleted: false });
    if (existing) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    let categoryImageUrl = "";
    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, "categories");
      categoryImageUrl = uploadResult;
    }

    const newCategory = new ProductCategory({
      categoryName,
      categorySlug: finalSlug,
      categoryStatus: categoryStatus || "active",
      categoryPosition: categoryPosition || 0,
      categoryParentID: categoryParentID || null,
      categoryImage: categoryImageUrl,
      createBy: {
        staffID: infoStaff._id,
        date: new Date()
      },
      updateBy: []
    });

    await newCategory.save();

    return res.status(201).json({
      code: 201,
      message: "Category created successfully",
      info: newCategory
    });
  } catch (err) {
    console.error("Error adding category:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      categoryName,
      categoryStatus,
      categoryPosition,
      categorySlug,
      categoryParentID
    } = req.body;

    const infoStaff = req["infoStaff"];

    const category = await ProductCategory.findOne({ _id: id, deleted: false });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (categoryParentID && categoryParentID === id) {
      return res.status(400).json({ message: "A category cannot be its own parent" });
    }

    if (categorySlug) {
      const slugExists = await ProductCategory.findOne({
        categorySlug,
        deleted: false,
        _id: { $ne: id }
      });

      if (slugExists) {
        return res.status(400).json({ message: "Slug already exists" });
      }
    }

    let categoryImageUrl = category.categoryImage;
    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, "categories");
      categoryImageUrl = uploadResult;
    }

    if (categoryName !== undefined) category.categoryName = categoryName;
    if (categoryStatus !== undefined) category.categoryStatus = categoryStatus;
    if (categoryPosition !== undefined) category.categoryPosition = categoryPosition;
    if (categorySlug !== undefined) category.categorySlug = categorySlug;
    if (categoryParentID !== undefined) category.categoryParentID = categoryParentID;
    category.categoryImage = categoryImageUrl;

    if (!Array.isArray(category.updateBy)) {
      category.updateBy = [];
    }
    category.updateBy.push({
      staffID: infoStaff._id,
      date: new Date()
    });

    await category.save();

    return res.status(200).json({
      code: 200,
      message: "Category updated successfully"
    });
  } catch (err) {
    console.error("Error updating category:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const infoStaff = req["infoStaff"];

    const category = await ProductCategory.findOne({ _id: id, deleted: false });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ categoryID: id, deleted: false });

    if (products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category. There are products linked to this category."
      });
    }


    category.deleted = true;
    category.deletedAt = new Date();
    category.deleteBy = {
      staffID: infoStaff._id,
      date: new Date()
    };

    await category.save();

    return res.status(200).json({
      code: 200,
      message: "Category deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
