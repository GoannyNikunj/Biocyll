const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobileNo: { type: Number, require: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  roll: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  isActive:{type: Boolean, required: true, default: true},
  Addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
}
,
  {
    timestamps:true
  });
const User = mongoose.model("User", userSchema);
module.exports = { User };
