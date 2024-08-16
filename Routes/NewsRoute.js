const express = require("express");
const NewsRouter = express.Router();
const NewsModel = require("../Model/News");

const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid");

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

    // const bucketRegion = process.env.AWS_REGION;
    // const bucketName = process.env.AWS_BUCKET_NAME;
    // const uploadedFileKey = uploadResponse.Key;
    // uploadResponse.fullUrl = `https://s3.${bucketRegion}.amazonaws.com/${bucketName}/${uploadedFileKey}`;
    return uploadResponse;
  } catch (error) {
    console.log("Error in uploadToS3NEW: ", error);
    throw error;
  }
};


NewsRouter.post("/api/post/News",upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadToS3(file);

    const News = new NewsModel({...req.body,image:result.Location});
    await News.save();
    res
      .status(200)
      .json({ msg: "News success added successfully", staus: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

NewsRouter.get("/api/get/News", async (req, res) => {
  try {
    const response = await NewsModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

NewsRouter.get("/api/get/News/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const response = await NewsModel.findOne({_id});
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

NewsRouter.delete("/api/delete/News/:id", async (req, res) => {
  try {
    const News = await NewsModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "deleted successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

NewsRouter.put(
  "/api/Update/News/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const NewsId = req.params.id;
      const payload = JSON.parse(JSON.stringify(req.body));
      const file = req.file;

      const existingNews = await NewsModel.findById(NewsId);

      if (!existingNews) {
        return res.status(404).json({ message: "News not found" });
      }

      // Update specific fields if present in the payload
      if (payload.heading) {
        existingNews.heading = payload.heading;
      }
      if (payload.Title) {
        existingNews.Title = payload.Title;
      }
      if (payload.description) {
        existingNews.description = payload.description;
      }
      if (payload.Date) {
        existingNews.Date = payload.Date;
      }
      // Add more fields to update as needed

      // Update specific image if present in the request
      if (file) {

          const existingImageUrl = existingNews.image;
          const existingImageKey = existingImageUrl.split("/").pop();
          
          await s3
            .deleteObject({ Bucket: "biocyll", Key: `biocyll/${existingImageKey}` })
            .promise();

          const params = {
            Bucket: "biocyll",
            Key: `biocyll/${Date.now()}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: "inline",
          };
          const uploadResult = await s3.upload(params).promise();

          // Update the image URL in the product
          existingNews.image = uploadResult.Location;
        

      }

      await existingNews.save();

      res.status(200).json({ message: "News updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = NewsRouter;
