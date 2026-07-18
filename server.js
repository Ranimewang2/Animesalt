const app = require("./src/app");

const PORT = process.env.PORT || 3000;

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AnimeSalt API running on port ${PORT}`);
  });
}
