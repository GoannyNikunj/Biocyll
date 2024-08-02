const mongoose = require("mongoose");
const CareerSchema = mongoose.Schema({
  Status: String,
  Experience: String,
  Qualifications: String,
  Location: String,
  Roles_Responsibilities: Array,
  Description: String,
  position:String,
  salary:String
});

const CareerModel = mongoose.model("Career", CareerSchema);

module.exports = CareerModel;
