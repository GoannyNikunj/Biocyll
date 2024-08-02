const mongoose = require("mongoose");

const ResumeSchema = mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  resume: String,
});

const resumeModel = mongoose.model("resume", ResumeSchema);

module.exports = resumeModel;
