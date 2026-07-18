const axios = require("axios");
const cheerio = require("cheerio");
const BASE = require("../utils/base");
const HEADERS = require("../configs/headers");

// GET /api/episode?id=naruto&season=1
const episodeScraper = async (anime_id, season = 1) => {
  try {
    // Hit first episode of the season to load the full episode list for that season
    const url = `${BASE}/episode/${anime_id}-${season}x1/`;
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    const episodes = [];
    $("#episode_by_temp li").each((_, el) => {
      const epNum = $(el).find(".num-epi").text().trim(); // e.g. "1x1"
      const [s, e] = epNum.split("x");
      const title   = $(el).find(".entry-title").text().trim();
      const href    = $(el).find("a").attr("href") || "";
      const ep_id   = href.replace(`${BASE}/episode/`, "").replace(/\/$/, "");

      const imgTag  = $(el).find("img");
      let image     = imgTag.attr("data-src") || imgTag.attr("data-lazy-src") || imgTag.attr("src") || "";
      if (image.startsWith("//")) image = "https:" + image;

      episodes.push({ title, season: s, episode: e, ep_id, image });
    });

    // Season tabs list
    const seasons = [];
    $(".aa-cnt li a").each((_, el) => {
      seasons.push({
        season: $(el).attr("data-season"),
        label:  $(el).text().trim(),
      });
    });

    const totalSeasons = $(".n_s").text().trim();

    return {
      success: true,
      message: "Data Found!!",
      results: { anime_id, totalSeasons, seasons, episodes }
    };
  } catch (err) {
    return { success: false, message: err.message, results: {} };
  }
};

module.exports = episodeScraper;
