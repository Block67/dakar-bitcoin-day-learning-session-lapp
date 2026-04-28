const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const { setupAuth } = require("./auth.js");
const { setupPay } = require("./pay.js");
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

// Setup modules
setupAuth(app);
setupPay(app);

// Routes
app.get("/", function (req, res) {
  res.render("index", {
    user: req.user
  });
});

app.get("/pay", function (req, res) {
  res.render("pay", {
    user: req.user,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`\nImportant: Make sure your .env is configured with BTCPay credentials.\n`);
});
