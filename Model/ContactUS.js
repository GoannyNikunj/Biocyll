const mongoose = require("mongoose");

const ContactUsSchema = mongoose.Schema({
  Name: String,
  Email: String,
  Phone: String,
  Company: String,
  Occupation: String,
  Message: String,
});

const ContactUsModel = mongoose.model("ContactUs", ContactUsSchema);

module.exports = ContactUsModel;
