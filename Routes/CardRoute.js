const express = require("express");
const CardRouter = express.Router();
const Card = require("../Model/Card");
const { authentication } = require("../Middlewares/Authentication");
const { Product } = require("../Model/Product");

// Route to get all cards by user
CardRouter.get("/api/get/card", authentication, async (req, res) => {
  const userId = req.user._id;
  try {
    const userCard = await Card.findOne({ user: userId }).populate(
      "items.product"
    );
    if (!userCard) {
      return res.status(404).json({ message: "Card not found for this user" });
    }
    res.json(userCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

CardRouter.post("/api/post/card", authentication, async (req, res) => {
  try {
    const userId = req.user._id;
    const { product, quantity } = req.body;

    // Validate that the product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: `Product with ID ${product} not found` });
    }

    // Find the card for the user
    let card = await Card.findOne({ user: userId });
    if (!card) {
      // If the card doesn't exist for the user, create a new one
      card = new Card({
        user: userId,
        items: [{ product, quantity }],
        total: existingProduct.price * quantity,
      });
    } else {
      // Check if the product already exists in the card items
      const existingItemIndex = card.items.findIndex(
        (item) => item.product.toString() === product
      );

      if (existingItemIndex !== -1) {
        card.items[existingItemIndex].quantity += quantity;
      } else {
        card.items.push({ product, quantity });
      }

      // Calculate the total
      let total = 0;
      for (const item of card.items) {
        const itemProduct = await Product.findById(item.product);
        total += item.quantity * itemProduct.price;
      }
      card.total = total;
    }

    await card.save();

    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

CardRouter.delete("/api/delete/card/:id", authentication, async (req, res) => {
  const itemId = req.params.id;
  try {
    const user = await Card.findOne({ user: req.user._id });
    // console.log(user);
    // Find the index of the item to remove
    const itemIndex = user.items.findIndex((item) => item._id == itemId);

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Item not found in user's items" });
    }

    const removedItem = user.items[itemIndex];
    const product = await Product.findById(removedItem.product);
    const removedItemPrice = product.price * removedItem.quantity;
    // Remove the item from the array
    user.items.splice(itemIndex, 1);

    // Recalculate the total
    user.total -= removedItemPrice;
    // Save the updated user
    await user.save();

    return res.json({ message: "Item removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// PUT route to update quantity of a product in the cart
CardRouter.put(
  "/api/carts/:cartId/items/:itemId",
  authentication,
  async (req, res) => {
    try {
      const { cartId, itemId } = req.params;
      const { action } = req.body; // 'increment' or 'decrement'

      // Find the cart by its ID
      const cart = await Card.findById(cartId).populate("items.product");
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Find the index of the item in the items array
      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === itemId
      );
      if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Update the quantity based on the action
      if (action === "increment") {
        cart.items[itemIndex].quantity++;
      } else if (action === "decrement") {
        // Ensure quantity doesn't go below 1
        if (cart.items[itemIndex].quantity > 1) {
          cart.items[itemIndex].quantity--;
        } else {
          return res
            .status(400)
            .json({ message: "Quantity cannot be less than 1" });
        }
      } else {
        return res.status(400).json({ message: "Invalid action" });
      }

      // Recalculate total amount
      cart.total = cart.items.reduce(
        (total, item) => total + item.quantity * item.product.price,
        0
      );

      // Save the updated cart
      await cart.save();

      // Return the updated cart
      res.json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = { CardRouter };
