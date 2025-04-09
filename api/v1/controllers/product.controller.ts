import { Request, Response } from "express";
import Product from "../../v1/models/product.model";
import ProductCategory from "../../v1/models/product-category.model";
import * as productsHelper from "../../../helper/products";
import mongoose from "mongoose";

// [GET] /products
export const index = async (req: Request, res: Response): Promise<void> => {
  const products = await Product.find({
    productStatus: "active",
    deleted: false
  }).sort({ position: "desc" });

  const newProducts = productsHelper.priceNewProducts(products);

  try {
    res.json({
      code: 200,
      message: "All product",
      info: newProducts,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error",
    });
  }
};

// [GET] /products/:slugCategory
export const category = async (req: Request<{ slugCategory: string }>, res: Response): Promise<void> => {
  try {
    const { slugCategory } = req.params;

    const category = await ProductCategory.findOne({
      categorySlug: slugCategory,
      deleted: false,
      categoryStatus: "active",
    });

    if (!category) {
      res.status(404).json({
        code: 404,
        message: "Category not found",
      });
    }

    const getSubCategoryIds = async (parentId: string): Promise<string[]> => {
      const subs = await ProductCategory.find({
        categoryParentID: parentId,
        categoryStatus: "active",
        deleted: false,
      });

      let ids = subs.map(sub => sub.id);

      for (const sub of subs) {
        const childIds = await getSubCategoryIds(sub.id);
        ids = ids.concat(childIds);
      }

      return ids;
    };

    const subCategoryIds = await getSubCategoryIds(category.id);

    // const allCategoryIds = [category.id, ...subCategoryIds].map(id => new mongoose.Types.ObjectId(id));
    
    const products = await Product.find({
      categoryID: { $in: [category.id, ...subCategoryIds] },
      productStatus: "active",
      deleted: false,
    }).sort({ productPosition: -1 });

    const newProducts = productsHelper.priceNewProducts(products);

    res.json({
      code: 200,
      message: `Products in category ${category.categoryName}`,
      info: newProducts,
    });
  } catch (error) {
    console.error("Error in category:", error);
    res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

// [GET] /products/detail/:slugProduct
export const detail = async (req: Request<{ slugProduct: string }>, res: Response): Promise<void> => {
  try {
    const slug = req.params.slugProduct;

    const product = await Product.findOne({
      slug,
      deleted: false,
      status: "active"
    });

    if (!product) return res.redirect("/");

    if (product.id) {
      const category = await ProductCategory.findOne({
        _id: product.id,
        deleted: false,
        status: "active"
      });

      if (category) {
        // @ts-ignore: thêm tạm property cho hiển thị
        product.category = category;
      }
    }

    // @ts-ignore: thêm tạm property cho hiển thị
    product.priceNew = productsHelper.priceNewProduct(product);

    res.render("client/pages/products/detail", {
      pageTitle: "Chi tiết sản phẩm",
      product
    });
  } catch (error) {
    res.redirect("/");
  }
};
