const { default: mongoose } = require("mongoose");
const mngoose = require("mongoose");

const teamSchema = mongoose.Schema({
  image: String,
  position: String,
  name: String,
});

const teamsModel = mongoose.model("Team", teamSchema);

module.exports = teamsModel;
