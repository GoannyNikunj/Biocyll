const mongoose = require("mongoose");

const NewsSchema = mongoose.Schema({
    image: String,
    heading: String,
    Title: String,
    description: String,
    Date: String
  });
const News = mongoose.model("News", NewsSchema);

module.exports = News ;
