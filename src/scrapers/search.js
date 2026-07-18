const axios = require("axios");
const cheerio = require("cheerio");
const BASE = require("../utils/base");
const HEADERS = require("../configs/headers");

const searchScraper = async (keyword, page = 1) => {
  try {
    const url = page > 1
      ? `${BASE}/?s=${encodeURIComponent(keyword)}&paged=${page}`
      : `${BASE}/?s=${encodeURIComponent(keyword)}`;

    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    const results = [];
    $("#aa-movies li").each((_, el) => {
      const title    = $(el).find("h2.entry-title").text().trim();
      const href     = $(el).find("a.lnk-blk").attr("href") || "";
      const isMovie  = href.includes("/movies/");
      const anime_id = href
        .replace(`${BASE}/series/`, "")
        .replace(`${BASE}/movies/`, "")
        .replace(/\/$/, "");

      const imgTag = $(el).find("img");
      let poster = imgTag.attr("data-src") || imgTag.attr("data-lazy-src") || imgTag.attr("src") || "";
      if (poster.startsWith("data:image")) poster = null;
      if (poster && poster.startsWith("//")) poster = "https:" + poster;

      const type = isMovie ? "movie" : "series";
      if (title && anime_id) results.push({ title, anime_id, poster, type });
    });

    const currentPage = Number($(".current").text().trim()) || page;
    let totalPages = 1;
    $(".page-link").each((_, el) => {
      const n = parseInt($(el).text().trim());
      if (!isNaN(n)) totalPages = Math.max(totalPages, n);
    });

    return { success: true, message: "Data Found!!", currentPage, totalPages, results };
  } catch (err) {
    return { success: false, message: err.message, results: [] };
  }
};

module.exports = searchScraper;
