require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const shortid = require("shortid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas using environment variable
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

// Create URL schema
const UrlSchema = new mongoose.Schema({
  longUrl: String,
  shortUrl: String,
});

const Url = mongoose.model("Url", UrlSchema);

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Shorten URL
app.post("/api/shorten", async (req, res) => {
  const { longUrl, customText } = req.body;
  let shortUrl;

  if (customText) {
    // Check if the custom text is available and not already in use
    const existingUrl = await Url.findOne({ shortUrl: customText });
    if (existingUrl) {
      return res.status(400).json({ error: "Custom text already in use" });
    }
    shortUrl = customText;
  } else {
    shortUrl = shortid.generate();
  }

  const newUrl = new Url({
    longUrl,
    shortUrl,
  });

  await newUrl.save();

  res.json({ shortUrl });
});

// Redirect to original URL
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (url) {
    res.redirect(url.longUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

// Handle all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
