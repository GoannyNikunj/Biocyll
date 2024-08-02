const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    pincode: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    landmark: String,
    alternatePhone: String,
    addressType: {
      type: String,
      enum: ["home", "office"],
      required: true,
    }
  },
  {
    timestamps: true // Correct placement for timestamps
  }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = { Address };
