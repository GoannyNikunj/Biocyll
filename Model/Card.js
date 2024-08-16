const mongoose = require('mongoose');

// Define card schema
const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  total: {
    type: Number,
    required: true,
    default: 0
  },
},{
  timestamps: true,
});

// Define card model
const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
