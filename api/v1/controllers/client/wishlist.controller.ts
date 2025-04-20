import { Request, Response } from "express";
import Wishlist from "../../models/wishlist.model";
import Product from "../../models/product.model";
import mongoose, {Types} from "mongoose";

// GET /wishlist
export const index = async (req: Request, res: Response) => {
  try {
    const userID = req["infoUser"]._id;

    let wishlist = await Wishlist.findOne({ userID }).populate({
      path: "wishListItemList.productID",
      match: { deleted: false, productStatus: "active" },
      select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });

    if (!wishlist) {
      wishlist = new Wishlist({ userID, wishListItemList: [] });
      await wishlist.save();
    }

    const validItems = wishlist.wishListItemList.filter(item => item.productID !== null);

    return res.status(200).json({
      message: validItems.length === 0 ? "Wishlist is empty" : "Wishlist fetched successfully",
      data: validItems,
    });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /wishlist/add
export const addPost = async (req: Request, res: Response) => {
  try {
    const userID = req["infoUser"]._id;
    const { productID } = req.body;

    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const product = await Product.findById(productID);
    if (!product || product.deleted || product.productStatus === "inactive") {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    let wishlist = await Wishlist.findOne({ userID: userID });

    if (!wishlist) {
      wishlist = new Wishlist({
        userID,
        wishListItemList: [{ productID: new Types.ObjectId(productID as string) }],
      });
    } else {
      const alreadyExists = wishlist.wishListItemList.some((item) =>
        item.productID.toString() === productID
      );
      if (alreadyExists) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      wishlist.wishListItemList.push({ productID: new mongoose.Types.ObjectId(productID as string) });
    }

    await wishlist.save();

    await wishlist.populate({
      path: "wishListItemList.productID",
      match: { deleted: false, productStatus: "active" },
      select:
        "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });

    const validItems = wishlist.wishListItemList.filter((item) => item.productID !== null);

    return res.status(200).json({ message: "Product added to wishlist", data: validItems });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /wishlist/delete
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const userID = req["infoUser"]._id;
    const { productID } = req.body;

    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const wishlist = await Wishlist.findOne({ userID: userID });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const index = wishlist.wishListItemList.findIndex(
      (item) => item.productID.toString() === productID
    );

    if (index === -1) {
      return res.status(404).json({ message: "Product not in wishlist" });
    }

    wishlist.wishListItemList.splice(index, 1);
    await wishlist.save();

    await wishlist.populate({
      path: "wishListItemList.productID",
      match: { deleted: false, productStatus: "active" },
      select:
        "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });

    const validItems = wishlist.wishListItemList.filter((item) => item.productID !== null);

    return res.status(200).json({ message: "Product removed from wishlist", data: validItems });
  } catch (err) {
    console.error("Delete wishlist item error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /wishlist/clear
export const clear = async (req: Request, res: Response) => {
  try {
    const userID = req["infoUser"]._id;

    const wishlist = await Wishlist.findOne({ userID: userID });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.wishListItemList = [];
    await wishlist.save();

    return res.status(200).json({ message: "Wishlist cleared successfully", data: [] });
  } catch (err) {
    console.error("Clear wishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};