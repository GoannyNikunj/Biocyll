const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    price: { type: Number },
    stock: { type: Number, default: 0 },
    banner: { type: String },
    images: [{ url: String }],
    offer: { type: String },
    Category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    reviews: {
      type: Array,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    benfit: Array,
    ModeOfAction: { type: String },
    MethodOfApplication: { type: Array },
    ProductSpecification: {
      technicalNameL: String,
      ProductTag: String,
      Producttype: String,
    },
    purpose:String,
    dosage:String,
    corps:String,
    cfuCount:Number,
    sku:Number
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = { Product }; //Changes
