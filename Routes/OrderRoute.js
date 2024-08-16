const express = require("express");
const { Order } = require("../Model/Order");
const OrderRouter = express.Router();
const { authentication } = require("../Middlewares/Authentication");
const { Product } = require("../Model/Product");

// Create a new order place
OrderRouter.post("/api/order/place", authentication, async (req, res) => {
  const payload = req.body;
  try {
    // Fetch products from the database
    const products = await Promise.all(
      payload.products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        // Check if there's enough stock
        if (product.stock < item.quantity) {
          throw new Error(
            `Not enough stock available for product with ID ${item.productId}`
          );
        }
        // Update stock
        product.stock -= item.quantity;
        await product.save();
        return {
          productId: product._id,
          quantity: item.quantity,
          price: item.price,
          status: item.status, // Added status field
        };
      })
    );

    // Create new order
    const newOrder = new Order({
      userId: payload.userId,
      products: products,
      paymentMethod: payload.paymentMethod,
      address: payload.address, // Added address field
    });

    // Save the order
    await newOrder.save();

    res.status(200).json({ msg: "Order saved successfully", status: true });
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
});

// Get all orders placed by a particular user
OrderRouter.get("/api/order/get/user/", authentication, async (req, res) => {
  const userId = req.user._id;
  console.log(userId);
  try {
    const orders = await Order.find({ userId: userId })
      .populate({
        path: "products.productId",
        select: "title images price description",
      })
      .populate("address");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single order by ID
OrderRouter.get("/api/get/order/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate("products.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

OrderRouter.patch("/api/update/order/:id", authentication, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { productId, status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const productIndex = order.products.findIndex(
      (product) => String(product.productId) === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    // Update the status of the product
    order.products[productIndex].status = status; // Use the status from request body

    // Save the updated order
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an order by ID
OrderRouter.delete("/api/delete/order/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { OrderRouter };
