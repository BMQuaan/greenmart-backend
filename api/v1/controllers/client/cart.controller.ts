import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import CartModel from "../../models/cart.model";
import Product from "../../models/product.model";

export const index = async (req: Request, res: Response) => {
    try {
      const userID = req["infoUser"]._id;
  
      let cart = await CartModel.findOne({ userID }).populate({
        path: "cartList.productID",
        match: { deleted: false, productStatus: "active" },
        select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
      });
  
      if (!cart) {
        cart = new CartModel({ userID, cartList: [] });
        await cart.save();
      }
  
      return res.status(200).json({
        message: cart.cartList.length === 0 ? "Cart is empty" : "Cart fetched",
        data: cart.cartList.filter(item => item.productID !== null),
      });
  
    } catch (err) {
      console.error("Get cart error:", err);
      return res.status(500).json({ message: "Server error" });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    const userID = req["infoUser"]._id;
    const { productID, quantity } = req.body;

    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        return res.status(400).json({ message: "Invalid product" });
    }

    const productObjId = new Types.ObjectId(productID as string);

    const product = await Product.findOne({ _id: productObjId, deleted: false, productStatus: "active" });
    if (!product) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }


    let cart = await CartModel.findOne({ userID: userID });
    if (!cart) {
        cart = new CartModel({
        userID,
        cartList: [{ productID: productObjId, quantity: quantity || 1 }],
        });
    } else {
        const item = cart.cartList.find((item) => item.productID.equals(productObjId));
        if (item) {
        item.quantity += quantity || 1;
        } else {
        cart.cartList.push({ productID: productObjId, quantity: quantity || 1 });
        }
    }

    await cart.save();

    await cart.populate({
      path: "cartList.productID",
      match: { deleted: false, productStatus: "active" },
      select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });

    res.status(200).json({
      message: "Added to cart",
      data: cart.cartList.filter(item => item.productID !== null),
    });
};

export const updateQuantity = async (req: Request, res: Response) => {
    const userID = req["infoUser"]._id;
    const { productID, quantity } = req.body;
  
    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({ message: "Invalid product" });
    }
  
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
  
    const productObjId = new Types.ObjectId(productID as string);
    const cart = await CartModel.findOne({ userID: userID });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
  
    const item = cart.cartList.find((item) => item.productID.equals(productObjId));
    if (!item) return res.status(404).json({ message: "Product not in cart" });
  
    item.quantity = quantity;
    await cart.save();
  
    await cart.populate({
      path: "cartList.productID",
      match: { deleted: false, productStatus: "active" },
      select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });
    
    res.status(200).json({
      message: "Quantity updated",
      data: cart.cartList.filter(item => item.productID !== null),
    });
};

export const deleteFromCart = async (req: Request, res: Response) => {
    const userID = req["infoUser"]._id;
    const { productID } = req.body;

    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        return res.status(400).json({ message: "Invalid product" });
    }

    const productObjId = new Types.ObjectId(productID as string);

    const cart = await CartModel.findOne({ userID: userID });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.cartList = cart.cartList.filter((item) => !item.productID.equals(productObjId));
    await cart.save();

    await cart.populate({
      path: "cartList.productID",
      match: { deleted: false, productStatus: "active" },
      select: "_id productName productPrice productImage productStock productDescription productSlug productDiscountPercentage categoryID",
    });
    
    res.status(200).json({
      message: "Product removed from cart",
      data: cart.cartList.filter(item => item.productID !== null),
    });
};

export const clearCart = async (req: Request, res: Response) => {
    const userID = req["infoUser"]._id;

    await CartModel.findOneAndUpdate({ userID }, { cartList: [] });
    res.status(200).json({ message: "Cart cleared" });
};
