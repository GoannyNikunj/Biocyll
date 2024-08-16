const express = require("express");
const BlogRouter = express.Router();
const blogModel = require("../Model/Blog");


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


BlogRouter.post("/api/post/Blog",upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadToS3(file);

    const Blog = new blogModel({...req.body,image:result.Location});
    await Blog.save();
    res
      .status(200)
      .json({ msg: "post success added successfully", staus: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});



BlogRouter.get("/api/get/Blog", async (req, res) => {
  try {
    const response = await blogModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

BlogRouter.get("/api/get/Blog/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const response = await blogModel.findOne({_id});
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

BlogRouter.delete("/api/delete/Blog/:id", async (req, res) => {
  try {
    const Blog = await blogModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "deleted successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

BlogRouter.put("/api/update/Blogs/:id", async (req, res) => {
  try {

    console.log(req.body);
    const existingBlog = await blogModel.findById(req.params.id);

    if(req.body.Title){
      existingBlog.heading = req.body.Title
    }

    if(req.body.description){
      existingBlog.description = req.body.description
    }

    if(req.body.Link){
      existingBlog.Link = req.body.Link
    }

    existingBlog.save();
    res.status(200).json({ msg: "Updated successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = BlogRouter;
