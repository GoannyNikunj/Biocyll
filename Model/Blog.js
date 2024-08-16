const mongoose = require("mongoose");
const blogSchema = mongoose.Schema({
  image: String,
  heading: String,
  description: String,
  Link: String,
});

const blogModel = mongoose.model("Blog", blogSchema);

module.exports = blogModel;
