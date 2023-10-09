"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  //BrightData Proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,

      password,
    },

    host: "brd.superproxy.io:22225",
    port,
    rejectUnauthorized: false,
  };

  try {
    //fetch product page

    const response = await axios.get(url, options);

    const $ = cheerio.load(response.data);

    //extract product title and price

    const title = $("#productTitle").text().trim();

    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const outOffStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      {};

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($(".a-price-symbol"));

    const stars = $("a.a-popover-trigger  span.a-size-base:eq(0) ")
      .text()
      .trim();

    const reviews = $("#acrCustomerReviewLink span.a-size-base:eq(0)")
      .text()
      .trim()
      .split(" ")[0];

    const discountRate = $(".savingsPercentage")
      .text()
      .trim()
      .replace(/[-%]/g, "");

    //construct data object with scraped information

    // console.log({
    //   title,
    //   currentPrice,
    //   originalPrice,
    //   outOffStock,
    //   imageUrls,
    //   currency,
    //   discountRate,
    //   stars,
    //   reviews,
    // });

    const data = {
      url,
      currency: currency || "₹",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(originalPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: "category",
      stars: Number(stars),
      reviews: reviews,
      isOutOfStock: outOffStock,
      lowestPrice: Number(currentPrice),
      highestPrice: Number(originalPrice),
      averagePrice: Number(currentPrice),
    };

    // console.log(data);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
