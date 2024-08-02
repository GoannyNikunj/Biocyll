const express = require("express");
const AdminRoute = express.Router();
const { User } = require("../Model/User");
const { authentication } = require("../Middlewares/Authentication");
const { Order } = require("../Model/Order");
// Get all users
AdminRoute.get("/get/all/users", authentication, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete user by id
AdminRoute.delete("/api/delete/user/:id", authentication, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findByIdAndDelete(id);

    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//get all counts
AdminRoute.get("/api/get/all/count", async (req, res) => {
  try {
    const { date } = req.query;
    let filter = {};

    // If date parameter is provided, filter orders based on that date
    if (date) {
      filter.createdAt = {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      };
    }

    const usersCount = await User.countDocuments();
    const allOrders = await Order.find(filter);
    const pendingOrders = await Order.aggregate([
      {
        $unwind: "$products" // Unwind the products array
      },
      {
        $match: {
          $and: [
            filter, // Apply the date filter
            { "products.status": "Pending" } // Match products with status "Pending"
          ]
        }
      },
      {
        $count: "totalPendingProducts" // Count the pending products across all orders
      }
    ]);
    
    // Check if there's any result, if not, set count to 0
    const pendingOrdersCount = pendingOrders.length > 0 ? pendingOrders[0].totalPendingProducts : 0;

    const processingOrders = await Order.aggregate([
      {
        $unwind: "$products" // Unwind the products array
      },
      {
        $match: {
          $and: [
            filter, // Apply the date filter
            { "products.status": "Processing" } // Match products with status "Pending"
          ]
        }
      },
      {
        $count: "totalProcessingProducts" // Count the pending products across all orders
      }
    ]);
    
    // Check if there's any result, if not, set count to 0
    const processingOrdersCount = processingOrders.length > 0 ? processingOrders[0].totalPendingProducts : 0;


    const deliveryOrders = await Order.aggregate([
      {
        $unwind: "$products" // Unwind the products array
      },
      {
        $match: {
          $and: [
            filter, // Apply the date filter
            { "products.status": "Delivered" } // Match products with status "Delivered"
          ]
        }
      },
      {
        $group: {
          _id: "$_id", // Group by order ID
          order: { $first: "$$ROOT" }, // Keep the original order document
          totalDeliveredProducts: { $sum: 1 } // Count the delivered products in each order
        }
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          order: 1, // Include the original order document
          totalDeliveredProducts: 1 // Include the total delivered products count
        }
      }
    ]);
    // Check if there's any result, if not, set count to 0
    // const deliveryOrdersCount = deliveryOrders.length > 0 ? deliveryOrders[0].totalDeliveredProducts : 0;
    let totalDeliveredProductsCount = 0;
    
    // Sum up the total count of delivered products
    deliveryOrders.forEach(order => {
      totalDeliveredProductsCount += order.totalDeliveredProducts;
    });
    
    console.log(deliveryOrders,"//////////")

    const shippedOrders = await Order.aggregate([
      {
        $unwind: "$products" // Unwind the products array
      },
      {
        $match: {
          $and: [
            filter, // Apply the date filter
            { "products.status": "Shipped" } // Match products with status "Pending"
          ]
        }
      },
      {
        $count: "totalShippedProducts" // Count the pending products across all orders
      }
    ]);
    
    // Check if there's any result, if not, set count to 0
    const shippedOrdersCount = shippedOrders.length > 0 ? shippedOrders[0].totalShippedProducts : 0;


    const cancelledOrders = await Order.aggregate([
      {
        $unwind: "$products" // Unwind the products array
      },
      {
        $match: {
          $and: [
            filter, // Apply the date filter
            { "products.status": "Cancelled" } // Match products with status "Pending"
          ]
        }
      },
      {
        $count: "totalCancelledProducts" // Count the pending products across all orders
      }
    ]);
    
    // Check if there's any result, if not, set count to 0
    const cancelledOrdersCount = cancelledOrders.length > 0 ? cancelledOrders[0].totalCancelledProducts : 0;



    // let totalIncome = 0;
    // const totalIncome = deliveryOrders?.reduce((total, order) => {
    //   const orderTotal = order.products.reduce((subtotal, product) => {
    //     return subtotal + product.quantity * product.price;
    //   }, 0);
    //   return total + orderTotal;
    // }, 0);

    res.json({
      usersCount,
      totalOrders: allOrders.length,
      pendingOrdersCount: pendingOrdersCount,
      processingOrdersCount: processingOrdersCount,
      deliveryOrdersCount: totalDeliveredProductsCount,
      // totalIncome,
      shippedOrdersCount: shippedOrdersCount,
      CancelledCount: cancelledOrdersCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
});


AdminRoute.get("/api/order/", async (req, res) => {
  const status = req.query.status;
  try {
    const response = await Order.find({ 'products.status': status }) // Use bracket notation
      .populate("products.productId")
      .populate("userId");

      const filteredOrders = response.filter(order => {
        // Filter products by status
        order.products = order.products.filter(product => product.status === status);
        // Keep the order only if it has products with the given status
        return order.products.length > 0;
      })
      // console.log(filteredOrders)
    res.send(filteredOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" }); // Send an appropriate error response
  }
});





// get all orders
AdminRoute.get("/api/getall/orders", authentication, async (req, res) => {
  try {
    const response = await Order.find()
      .populate("products.productId")
      .populate("userId")
      .populate({
        path: "products.productId",
        populate: {
          path: "Category",
        },
      });
    res.send(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(err);
  }
});

// Get all orders placed by a particular user
AdminRoute.get("/api/orders/get/user/:id", authentication, async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  try {
    const orders = await Order.find({ userId: userId })
      .populate({
        path: "products.productId",
        select: "title images price description",
      })
      .populate("address")
      .populate("userId")
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  AdminRoute,
};
