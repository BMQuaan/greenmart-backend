import { IProduct } from "../api/v1/models/product.model";

interface IProductWithPriceNew extends IProduct {
  priceNew?: string;
}

export const priceNewProducts = (products: IProduct[]): IProductWithPriceNew[] => {
  return products.map((item) => {
    const rawPrice = (item.productPrice * (100 - item.productDiscountPercentage)) / 100;
    const priceNew = Number(rawPrice.toFixed(2));
    return {
      ...item.toObject(),
      priceNew
    };
  });
};

export const priceNewProduct = (product: IProduct): string => {
  const rawPrice = (product.productPrice * (100 - product.productDiscountPercentage)) / 100;
  const priceNew = Number(rawPrice.toFixed(2));
  return priceNew.toString();
};

// export const priceNewProduct = (product: IProduct): IProductWithPriceNew => {
//   const priceNew = ((product.productPrice * (100 - product.productDiscountPercentage)) / 100).toFixed(0);

//   return {
//     ...product.toObject(),
//     priceNew
//   };
// };
