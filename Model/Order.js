const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        status: {
          type: String,
          enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
          default: "Pending",
        },
      },
    ],
    
    paymentMethod: String,
    address:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    deliveryDate: {
      type: Date,
      default: function() {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 5); 
        return currentDate;
      }
    }
  },
  {
    timestamps:true
  }
);
const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
