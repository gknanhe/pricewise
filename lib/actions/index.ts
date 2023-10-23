"use server";

import { revalidatePath } from "next/cache";

import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scraper/index";
import { connectToDB } from "../mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types/index";
import { generateEmailBody, sendEmail } from "../nodemailer/index";

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

export async function getProductById(productId: string) {
  try {
    connectToDB();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById({ _id: productId });

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3); //this will fetch 3 product except current product $ne => not equal to
    // console.log("similar Products" + similarProducts);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    const product = await Product.findById(productId);

    if (!product) return;
    // type like User
    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    ); /*.some() method: The some method is an array method in 
    JavaScript. It checks whether at least one element in the array satisfies the given condition. */

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save(); //to save product

      const emailContent = generateEmailBody(product, "WELCOME");

      //function to send email
      // await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
