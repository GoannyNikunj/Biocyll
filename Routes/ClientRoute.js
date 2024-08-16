const express = require("express");
const ClientRouter = express.Router();

const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const ClientModel = require("../Model/Client");

//  Set up AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
});

// Multer S3 storage configuration
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });
const uploadToS3 = async (file) => {
  try {
    const params = {
      Bucket: "biocyll",
      Key: `biocyll/${Date.now()}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: "inline",
    };

    let uploadResponse = await s3.upload(params).promise();

    return uploadResponse;
  } catch (error) {
    console.log("Error in uploadToS3NEW: ", error);
    throw error;
  }
};

ClientRouter.post("/api/add/client", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadToS3(file);

    const response = new ClientModel({ ...req.body, image: result.Location });
    await response.save();
    res.status(200).json({ msg: "client added successfully", staus: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

ClientRouter.get("/api/get/Client", async (req, res) => {
  try {
    const response = await ClientModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = ClientRouter;
