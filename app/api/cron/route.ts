//This WILL GO TO ALL PRODUCT AND SEND MAILS

import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer/index";
import { scrapeAmazonProduct } from "@/lib/scraper/index";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "@/node_modules/next/server";

//Some changes to deploy to vercel

export const maxDuration = 10; //300; //5 minutes It can only set with pro plans
export const dynamic = "force-dynamic";
export const revalidate = 0;

//

export async function GET() {
  try {
    //COnnect To DB Before
    connectToDB();

    //FInd all Products
    const products = await Product.find({});

    if (!products) throw new Error("No Products Found");

    //  1. SCRAPE LATEST PRODUCT DETAILS & UPDATE DATAbASE

    //inside this Promise.all we can call multiple async funct
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        //scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) throw new Error("No Product found");

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        //calculating relative prices from array whre we store till pricess
        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product
        );

        // 2. CHECK EACH PRODUCTS STATUS & SEND EMAIL ACCORDINGLY

        //get email Notification type based on product
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        //check for users and send mail
        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
            image: updatedProduct.image,
          };

          //Generate Email Content Accordingly
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifType
          );

          //collect user email in array
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          await sendEmail(emailContent, userEmails);
        }

        //will be created into array
        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts, //array of updated products
    });
  } catch (error) {
    throw new Error(`Error in GET: ${error}`);
  }
}
