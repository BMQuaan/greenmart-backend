import mongoose, { Document, Schema } from "mongoose";

interface IWishlistItem {
  productID: mongoose.Types.ObjectId;
}

export interface IWishlist extends Document {
  userID: mongoose.Types.ObjectId;
  wishListItemList: IWishlistItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    wishListItemList: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema, "wishlists");

export default Wishlist;
