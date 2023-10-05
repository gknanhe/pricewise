"use server";

import { scrapeAmazonProduct } from "../scraper/index";

//will run on server not on client side

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    //store data in database
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}
