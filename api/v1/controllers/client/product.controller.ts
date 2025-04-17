import { Request, Response } from "express";
import Product from "../../models/product.model";
import ProductCategory from "../../models/product-category.model";
import * as productsHelper from "../../../../helper/products";
import { IProduct } from "../../models/product.model";
import { IProductCategory } from "../../models/product-category.model";
import { paginationHelper } from "../../../../helper/pagination";
import { SearchHelper } from "../../../../helper/search";
import mongoose from "mongoose";

export interface IProductExtended extends IProduct {
  category?: IProductCategory;
  priceNew?: string;
}

// [GET] /products

export const index = async (req: Request, res: Response) => {
  try {
    interface IProductFind {
      deleted: boolean;
      productStatus?: string;
      productName?: RegExp;
    }
    // Search
    const objectSearch = SearchHelper(req.query);

    const find: IProductFind = {
      deleted: false,
      productStatus: "active", 
    };

    if (req.query.keyword) {
      find.productName = objectSearch.regex;
    }

    // Pagination
    const initPagination = {
      currentPage: 1,
      limitItems: 10,
    };

    const countProducts = await Product.countDocuments(find);
    const objectPagination = paginationHelper(initPagination, req.query, countProducts);
    objectPagination.totalItem = countProducts;


    // Sort
    const sort: Record<string, any> = {};

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue;
    } else {
      sort.productPosition = "desc";
    }

    const products = await Product.find(find)
      .select("_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID")
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    let newProducts: IProductExtended[] = productsHelper.priceNewProducts(products);

    if (req.query.sortKey === "productPrice" && req.query.sortValue) {
      const direction = req.query.sortValue === "asc" ? 1 : -1;
      newProducts = newProducts.sort((a, b) => {
        const aPrice = parseFloat(a.priceNew || "0");
        const bPrice = parseFloat(b.priceNew || "0");
        return (aPrice - bPrice) * direction;
      });
    }

    res.json({
      code: 200,
      message: "Products List",
      info: newProducts,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Error in product index:", error);
    res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

// [GET] /products/:slugCategory
export const category = async (req: Request<{ slugCategory: string }>, res: Response) => {
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
      return;
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

    const allCategoryIds = [category.id, ...subCategoryIds];

    const find = {
      categoryID: { $in: allCategoryIds },
      productStatus: "active",
      deleted: false,
    };

    // Pagination
    const initPagination = {
      currentPage: 1,
      limitItems: 10,
    };

    
    const countProducts = await Product.countDocuments(find);
    const objectPagination = paginationHelper(initPagination, req.query, countProducts);
    objectPagination.totalItem = countProducts;

    // Sort
    const sort: Record<string, any> = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue;
    } else {
      sort.productPosition = "desc";
    }

    // Query
    const products = await Product.find(find)
      .select("_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID")
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);
      

    let newProducts: IProductExtended[] = productsHelper.priceNewProducts(products);

    if (req.query.sortKey === "productPrice" && req.query.sortValue) {
      const direction = req.query.sortValue === "asc" ? 1 : -1;
      newProducts = newProducts.sort((a, b) => {
        const aPrice = parseFloat(a.priceNew || "0");
        const bPrice = parseFloat(b.priceNew || "0");
        return (aPrice - bPrice) * direction;
      });
    }

    res.json({
      code: 200,
      message: `Products in category ${category.categoryName}`,
      info: newProducts,
      pagination: objectPagination,
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
export const detail = async (
  req: Request<{ slugProduct: string }>,
  res: Response
) => {
  try {
    const slug = req.params.slugProduct;

    const product = await Product.findOne({
      productSlug: slug,
      deleted: false,
      productStatus: "active"
    }).select("_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID");

    if (!product) {
      res.json({
        code: 404,
        message: "Product not found",
      });
      return;
    }

    // thêm thông tin category
    const productObj: IProductExtended = product.toObject();

    if (productObj.categoryID) {
      const category = await ProductCategory.findOne({
        _id: productObj.categoryID,
        deleted: false,
        categoryStatus: "active"
      }).select("_id categoryName categorySlug categoryImage categoryParentID");

      if (category) {
        productObj.category = category;
      }
    }

    productObj.priceNew = productsHelper.priceNewProduct(product);

    res.json({
      code: 200,
      message: "Product detail",
      info: productObj
    });
    return;
    
  } catch (error) {
    console.error("Error in detail:", error);
    res.json({
      code: 500,
      message: "Internal Server Error",
    });
    return;
  }
};

