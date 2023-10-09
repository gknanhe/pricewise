"use client";

import { scrapeAndStoreProduct } from "@/lib/actions/index";
import { url } from "inspector";
import { FormEvent, useState } from "react";

const Searchbar = () => {
  const [serachPrompt, setSerachPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //check url is valid
  const isValidAmazonProductURL = (url: string) => {
    try {
      //parsing url
      const parsedURL = new URL(url); //browser class that gives url properties like hostnanme, host
      const hostname = parsedURL.hostname; //gives hostname eg. amazon.com

      if (
        hostname.includes("amazon.com") ||
        hostname.includes("amazon.") ||
        hostname.endsWith("amazon")
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductURL(serachPrompt);

    if (!isValidLink) return alert("Please provide a valid Amazon link");

    try {
      setIsLoading(true);

      //scrape the product

      const product = await scrapeAndStoreProduct(serachPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12 " onSubmit={handleSubmit}>
      <input
        type="text"
        value={serachPrompt}
        onChange={(e) => setSerachPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={serachPrompt === ""}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;
