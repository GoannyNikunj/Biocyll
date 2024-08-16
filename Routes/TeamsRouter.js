const express = require("express");
const TeamsRouter = express.Router();

const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const teamsModel = require("../Model/Team");

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

TeamsRouter.post("/api/add/team", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadToS3(file);

    const response = new teamsModel({ ...req.body, image: result.Location });
    await response.save();
    res.status(200).json({ msg: "member added successfully", staus: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

TeamsRouter.get("/api/get/teams", async (req, res) => {
  try {
    const response = await teamsModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});



module.exports = TeamsRouter;
