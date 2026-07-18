const axios = require("axios");
const cheerio = require("cheerio");
const BASE = require("../utils/base");
const HEADERS = require("../configs/headers");

const infoScraper = async (anime_id) => {
  try {
    const url = `${BASE}/series/${anime_id}/`;
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    const title    = $(".fg1 .entry-title").text().trim();
    const overview = $(".description p").first().text().trim();

    // Additional meta lines: Language, Quality, Running time
    let language, quality, runningTime;
    $(".description p").slice(1).each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes("Language:"))     language    = text.replace("Language:", "").trim();
      if (text.includes("Quality:"))      quality     = text.replace("Quality:", "").trim();
      if (text.includes("Running time:")) runningTime = text.replace("Running time:", "").trim();
    });

    const genres  = $(".genres a").map((_, el) => $(el).text().trim()).get();
    const year    = $(".year").first().text().trim();
    const seasons = $(".seasons").text().replace("Seasons", "").trim();
    const episodes = $(".entry-meta .episodes").text().replace("Episodes", "").trim();
    const rating  = $(".vote-cn .vote").text().replace("TMDB", "").trim();

    const imgSrc  = $(".post-thumbnail img").attr("src") || $(".post-thumbnail img").attr("data-src") || "";
    const poster  = imgSrc.startsWith("//") ? "https:" + imgSrc : imgSrc;

    // Season tabs
    const season_list = [];
    $(".aa-cnt li a").each((_, el) => {
      season_list.push({
        season: $(el).attr("data-season"),
        label:  $(el).text().trim(),
      });
    });

    return {
      success: true,
      message: "Data Found!!",
      results: {
        title, anime_id, poster, overview,
        language, quality, runningTime,
        genres, year, seasons, episodes, rating,
        season_list,
      }
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

module.exports = infoScraper;
