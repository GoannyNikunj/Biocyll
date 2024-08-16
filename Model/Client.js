const mongoose = require("mongoose");

const ClientSchema = mongoose.Schema({
  image: String,
  company_name: String,
  decription: String,
});

const ClientModel = mongoose.model("Client", ClientSchema);

module.exports = ClientModel;
