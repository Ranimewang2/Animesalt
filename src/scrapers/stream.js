const axios = require("axios");
const cheerio = require("cheerio");
const BASE = require("../utils/base");
const HEADERS = require("../configs/headers");

// GET /api/stream?id=naruto&season=1&ep=1
// Returns all video server iframes for an episode
const streamScraper = async (anime_id, season, ep) => {
  try {
    const episodeUrl = `${BASE}/episode/${anime_id}-${season}x${ep}/`;
    const { data } = await axios.get(episodeUrl, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    const servers = [];

    // Real selector from the original code: #aa-options > div.video
    $("#aa-options > div.video").each((_, el) => {
      let iframe = $(el).find("iframe").attr("src") || $(el).find("iframe").attr("data-src");
      if (!iframe) return;
      iframe = iframe.replace(/&#038;/g, "&");
      const server_id = $(el).attr("id") || `server-${servers.length + 1}`;
      servers.push({ server_id, iframe });
    });

    // Fallback: any iframe on the page
    if (servers.length === 0) {
      $("iframe").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src && !src.includes("youtube") && !src.includes("google.com/maps")) {
          servers.push({ server_id: `server-${servers.length + 1}`, iframe: src });
        }
      });
    }

    if (servers.length === 0) {
      return { success: false, message: "No stream servers found", results: [] };
    }

    return {
      success: true,
      message: "Stream Found!!",
      episode_url: episodeUrl,
      results: servers,
    };
  } catch (err) {
    return { success: false, message: err.message, results: [] };
  }
};

// GET /api/moviestream?id=movie-slug
// Returns all video server iframes for a movie
const movieStreamScraper = async (anime_id) => {
  try {
    const urls = [
      `${BASE}/movies/${anime_id}/`,
      `${BASE}/movies/${anime_id}`,
    ];

    let data;
    for (const url of urls) {
      try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        data = res.data;
        if (data) break;
      } catch (_) { continue; }
    }

    if (!data) return { success: false, message: "Movie page not found", results: [] };

    const $ = cheerio.load(data);
    const servers = [];

    // Primary: video player aside iframes
    $("aside.video-player iframe, #aa-options > div.video iframe").each((_, el) => {
      let src = $(el).attr("src") || $(el).attr("data-src");
      if (!src) return;
      src = src.replace(/&#038;/g, "&");
      servers.push({ server_id: `server-${servers.length + 1}`, iframe: src });
    });

    // Fallback: any non-YouTube iframe
    if (servers.length === 0) {
      $("iframe").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src && !src.includes("youtube") && !src.includes("google.com/maps")) {
          servers.push({ server_id: `server-${servers.length + 1}`, iframe: src });
        }
      });
    }

    return {
      success: true,
      message: servers.length ? "Stream Found!!" : "No servers found",
      results: servers,
    };
  } catch (err) {
    return { success: false, message: err.message, results: [] };
  }
};

module.exports = { streamScraper, movieStreamScraper };
