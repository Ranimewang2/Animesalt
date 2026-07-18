const axios = require("axios");
const cheerio = require("cheerio");
const BASE = require("../utils/base");
const HEADERS = require("../configs/headers");

const homeScraper = async () => {
  try {
    const { data } = await axios.get(BASE, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    // ── Fresh Drops (latest episode updates)
    const fresh_drops = [];
    $(".latest-ep-swiper-slide").each((_, el) => {
      const title  = $(el).find(".entry-title").text().trim();
      const href   = $(el).find(".lnk-blk").attr("href") || "";
      const anime_id = href.replace(`${BASE}/series/`, "").replace(/\/$/, "");
      const imgSrc = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "";
      const poster = imgSrc.startsWith("//") ? "https:" + imgSrc : imgSrc;
      const season  = $(el).find(".post-ql").text().replace("Season", "").trim();
      const episode = $(el).find(".year").text().replace("EP:", "").trim();
      if (title && anime_id) fresh_drops.push({ title, anime_id, poster, season, episode });
    });

    // ── Latest Anime Movies
    const latest_movies = [];
    $(".latest-movies-series-swiper-slide li.type-movies.category-anime").each((_, el) => {
      const title   = $(el).find("img").attr("alt")?.trim().replace("Image ", "") || null;
      const href    = $(el).find(".lnk-blk").attr("href") || "";
      const anime_id = href.replace(`${BASE}/movies/`, "").replace(/\/$/, "");
      const imgSrc  = $(el).find("img").attr("data-src") || "";
      const poster  = imgSrc.startsWith("//") ? "https:" + imgSrc : imgSrc;
      if (title && anime_id) latest_movies.push({ title, anime_id, poster });
    });

    // ── Most Watched Series
    const most_watched_series = [];
    $("#torofilm_wdgt_popular-3-all .chart-item").each((_, el) => {
      const rank    = $(el).find(".chart-number").text().trim();
      const title   = $(el).find(".chart-title").text().trim();
      const href    = $(el).find(".chart-poster").attr("href") || "";
      const anime_id = href.replace(`${BASE}/series/`, "").replace(/\/$/, "");
      const imgSrc  = $(el).find(".chart-poster img").attr("data-src") || "";
      const poster  = imgSrc.startsWith("//") ? "https:" + imgSrc : imgSrc;
      if (title) most_watched_series.push({ rank, title, anime_id, poster });
    });

    // ── Most Watched Movies
    const most_watched_movies = [];
    $("#torofilm_wdgt_popular-4-all .chart-item, #torofilm_wdgt_popular-3-movies .chart-item").each((_, el) => {
      const rank    = $(el).find(".chart-number").text().trim();
      const title   = $(el).find(".chart-title").text().trim();
      const href    = $(el).find(".chart-poster").attr("href") || "";
      const anime_id = href.replace(`${BASE}/movies/`, "").replace(/\/$/, "");
      const imgSrc  = $(el).find(".chart-poster img").attr("data-src") || "";
      const poster  = imgSrc.startsWith("//") ? "https:" + imgSrc : imgSrc;
      if (title) most_watched_movies.push({ rank, title, anime_id, poster });
    });

    return {
      success: true,
      message: "Data Found!!",
      results: { fresh_drops, latest_movies, most_watched_series, most_watched_movies }
    };
  } catch (err) {
    return { success: false, message: err.message, results: {} };
  }
};

module.exports = homeScraper;
