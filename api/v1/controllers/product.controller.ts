import { Request, Response } from "express";
import Product from "../../v1/models/product.model";
import ProductCategory from "../../v1/models/product-category.model";
import * as productsHelper from "../../../helper/products";

// [GET] /products
export const index = async (req: Request, res: Response): Promise<void> => {
  const products = await Product.find();

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
  const slugCategory = req.params.slugCategory;

  const category = await ProductCategory.findOne({
    slug: slugCategory,
    deleted: false,
    status: "active",
  });

  if (!category) {
    return res.redirect("/");
  }

  const getSubCategory = async (parentId: string): Promise<any[]> => {
    const subs = await ProductCategory.find({
      parent_id: parentId,
      status: "active",
      deleted: false,
    });

    let allSub = [...subs];

    for (const sub of subs) {
      const childs = await getSubCategory(sub.id);
      allSub = allSub.concat(childs);
    }

    return allSub;
  };

  const listSubCategory = await getSubCategory(category.id);
  const listSubCategoryId = listSubCategory.map(item => item.id);

  const products = await Product.find({
    product_category_id: { $in: [category.id, ...listSubCategoryId] },
    status: "active",
    deleted: false
  }).sort({ position: "desc" });

  const newProducts = productsHelper.priceNewProducts(products);

  res.render("client/pages/products/index", {
    pageTitle: category.categoryName,
    products: newProducts
  });
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
