const express = require("express");
const Addressrouter = express.Router();
const { Address } = require("../Model/Address");
const { authentication } = require("../Middlewares/Authentication");
const { User } = require("../Model/User");

// POST route to create a new address for a user
Addressrouter.post("/api/post/address", authentication, async (req, res) => {
  const userId = req.user._id;
  try {
    const address = new Address(req.body);
    await address.save();

    await User.findByIdAndUpdate(userId, { $push: { Addresses: address._id } });

    res.status(201).send({ message: "Address created successfully", address });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update address
Addressrouter.put("/api/update/address/:addressId", authentication, async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.addressId;
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      req.body,
      { new: true }
    );
    if (!updatedAddress) {
      return res.status(404).send({ error: "Address not found" });
    }

    res.send(updatedAddress);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete address
Addressrouter.delete("/api/delete/address/:addressId", authentication, async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.addressId;
  try {
    const deletedAddress = await Address.findByIdAndDelete(addressId);
    if (!deletedAddress) {
      return res.status(404).send({ error: "Address not found" });
    }

    // Remove the deleted address from the user's Addresses array
    await User.findByIdAndUpdate(userId, { $pull: { Addresses: addressId } });

    res.send({ message: "Address deleted successfully", deletedAddress });

  } catch (error) {
    res.status(400).send(error);
  }
});

// Get addresses by user ID
Addressrouter.get("/api/get/user/address", authentication, async (req, res) => {
  const userId = req.user._id;
  try {
    // Find the user by ID and populate the Addresses field
    const user = await User.findById(userId).populate("Addresses");
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send(user.Addresses);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = { Addressrouter };
