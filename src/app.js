const express = require("express");
const cors    = require("cors");

const homeScraper        = require("./scrapers/home");
const searchScraper      = require("./scrapers/search");
const seriesScraper      = require("./scrapers/series");
const moviesScraper      = require("./scrapers/movies");
const infoScraper        = require("./scrapers/info");
const episodeScraper     = require("./scrapers/episodes");
const { streamScraper, movieStreamScraper } = require("./scrapers/stream");

const app = express();
app.use(cors());
app.use(express.json());

// ── Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "AnimeSalt API",
    source: "animesalt.ac",
    version: "1.0.0",
    endpoints: {
      home:        "GET /api/home",
      search:      "GET /api/search?q=naruto&page=1",
      series:      "GET /api/series?page=1",
      movies:      "GET /api/movies?page=1",
      info:        "GET /api/info?id=naruto",
      episodes:    "GET /api/episodes?id=naruto&season=1",
      stream:      "GET /api/stream?id=naruto&season=1&ep=1",
      moviestream: "GET /api/moviestream?id=demon-slayer-movie",
    }
  });
});

// ── Home
app.get("/api/home", async (req, res) => {
  const result = await homeScraper();
  res.json(result);
});

// ── Search
app.get("/api/search", async (req, res) => {
  const q    = (req.query.q || req.query.query || "").trim();
  const page = parseInt(req.query.page) || 1;
  if (!q) return res.status(400).json({ success: false, message: "Missing q parameter" });
  const result = await searchScraper(q, page);
  res.json(result);
});

// ── Series list
app.get("/api/series", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const result = await seriesScraper(page);
  res.json(result);
});

// ── Movies list
app.get("/api/movies", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const result = await moviesScraper(page);
  res.json(result);
});

// ── Series info / detail
app.get("/api/info", async (req, res) => {
  const id = (req.query.id || "").trim();
  if (!id) return res.status(400).json({ success: false, message: "Missing id parameter" });
  const result = await infoScraper(id);
  res.json(result);
});

// ── Episodes list for a season
app.get("/api/episodes", async (req, res) => {
  const id     = (req.query.id || "").trim();
  const season = parseInt(req.query.season) || 1;
  if (!id) return res.status(400).json({ success: false, message: "Missing id parameter" });
  const result = await episodeScraper(id, season);
  res.json(result);
});

// ── Episode stream servers
app.get("/api/stream", async (req, res) => {
  const id     = (req.query.id || "").trim();
  const season = (req.query.season || "").trim();
  const ep     = (req.query.ep || "").trim();
  if (!id || !season || !ep) {
    return res.status(400).json({ success: false, message: "Missing id, season, or ep parameter" });
  }
  const result = await streamScraper(id, season, ep);
  res.json(result);
});

// ── Movie stream servers
app.get("/api/moviestream", async (req, res) => {
  const id = (req.query.id || "").trim();
  if (!id) return res.status(400).json({ success: false, message: "Missing id parameter" });
  const result = await movieStreamScraper(id);
  res.json(result);
});

// ── 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;
