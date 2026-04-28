const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const { setupAuth } = require("./auth.js");
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(expressLayouts);

// Static files
app.use('/js', express.static('src/js'));
app.use(express.static('public'));

// Views setup
app.set("view engine", "ejs");
app.set("views", "src/views");

// Setup Authentication Module
setupAuth(app);

// Main Routes
app.get("/", function (req, res) {
  res.render("index", {
    user: req.user
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Authentication Server running!`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});
