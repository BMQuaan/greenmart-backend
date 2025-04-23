import { Request, Response } from "express";
import Product from "../../models/product.model";
import ProductCategory from "../../models/product-category.model";
import * as productsHelper from "../../../../helper/products";
import { IProduct } from "../../models/product.model";
import { IProductCategory } from "../../models/product-category.model";
import { paginationHelper } from "../../../../helper/pagination";
import { SearchHelper } from "../../../../helper/search";
import { uploadImageToCloudinary } from "../../../../helper/uploadCloudinary";
import slugify from "slugify";

export interface IProductExtended extends IProduct {
  category?: IProductCategory;
  priceNew?: string;
}

// [GET] /products
export const index = async (req: Request, res: Response) => {
  try {
    interface IProductFind {
      deleted: boolean;
      productName?: RegExp;
    }
    // Search
    const objectSearch = SearchHelper(req.query);

    const find: IProductFind = {
      deleted: false,
    };

    if (req.query.keyword) {
      find.productName = objectSearch.regex;
    }
    // Sort
    const sort: Record<string, any> = {};

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey.toString()] = req.query.sortValue;
    } else {
      sort.productPosition = "desc";
    }

    const products = await Product.find(find)
      .sort(sort)

    let newProducts: IProductExtended[] = productsHelper.priceNewProducts(products);

    if (req.query.sortKey === "productPrice" && req.query.sortValue) {
      const direction = req.query.sortValue === "asc" ? 1 : -1;
      newProducts = newProducts.sort((a, b) => {
        const aPrice = parseFloat(a.priceNew || "0");
        const bPrice = parseFloat(b.priceNew || "0");
        return (aPrice - bPrice) * direction;
      });
    }

    res.status(200).json({
      code: 200,
      message: "Products List",
      info: newProducts,
    });
  } catch (error) {
    console.error("Error in product index:", error);
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
      });
  
      if (!product) {
        res.status(404).json({
          code: 404,
          message: "Product not found",
        });
        return;
      }
  
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
  
      res.status(200).json({
        code: 200,
        message: "Product detail",
        info: productObj
      });
      return;
      
    } catch (error) {
      console.error("Error in detail:", error);
      res.status(500).json({
        code: 500,
        message: "Internal Server Error",
      });
      return;
    }
};


export const addItem = async (req: Request, res: Response) => {
  try {
    const {
      productName,
      productPrice,
      productStock,
      productDescription,
      productStatus,
      productPosition,
      productDiscountPercentage,
      categoryID,
      productSlug
    } = req.body;

    const infoStaff = req["infoStaff"];

    if (!productName || !productPrice || !categoryID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let productImageUrl = "";
    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, "products");
      productImageUrl = uploadResult;
    }

    let finalSlug = productSlug?.trim();
    if (!finalSlug) {
      finalSlug = slugify(productName, { lower: true, strict: true });
    }

    const existing = await Product.findOne({ productSlug: finalSlug, deleted: false });
    if (existing) {
      return res.status(400).json({ message: "Slug already exists. Please choose a different one." });
    }

    const newProduct = new Product({
      productName,
      productSlug: finalSlug,
      productPrice,
      productStock: productStock || 0,
      productDescription,
      productStatus: productStatus || "active",
      productPosition: productPosition || 0,
      productDiscountPercentage: productDiscountPercentage || 0,
      productImage: productImageUrl,
      categoryID,
      createBy: infoStaff._id
    });

    await newProduct.save();

    return res.status(201).json({
      code: 201,
      message: "Product created successfully",
      info: newProduct
    });

  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};