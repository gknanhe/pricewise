"use server";

import { revalidatePath } from "next/cache";

import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scraper/index";
import { connectToDB } from "../mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

//will run on server not on client side

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    // console.log("caling conectDB");
    connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      //if doesnt exist will create in DB
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}
