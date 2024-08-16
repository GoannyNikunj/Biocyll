const express = require("express");
const CareerRouter = express.Router();
const CareerModel = require("../Model/Career");

CareerRouter.post("/api/post/career", async (req, res) => {
  try {
    const Career = new CareerModel(req.body);
    await Career.save();
    res
      .status(200)
      .json({ msg: "post success added successfully", staus: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

CareerRouter.get("/api/get/career", async (req, res) => {
  try {
    const response = await CareerModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

CareerRouter.delete("/api/delete/career/:id", async (req, res) => {
  try {
    const career = await CareerModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "deleted successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

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

const nodemailer = require("nodemailer");

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bhandarisaurabh143@gmail.com",
    pass: "qucn cjnh rfjo uhss",
  },
});
//post contact us impormation
const resumeModel = require("../Model/Resume");
CareerRouter.post(
  "/api/post/resume",
  upload.single("file"),
  async (req, res) => {
    const { name, email, mobile } = req.body;
    try {
      const file = req.file;
      const result = await uploadToS3(file);
      const resume = new resumeModel({...req.body,resume:result?.Location});
      await resume.save();
      // Email details
      let mailOptions = {
        from: `"${name}" <${email}>`,
        to: "Inquiry1@biocyll.com",
        subject: "New Job Application Received :",
        text: `New Job Application Received:<br>
      <strong>Name:</strong> ${name}<br>
      <strong>Email:</strong> ${email}<br><br>
      <strong>Email:</strong> ${mobile}<br><br>
      Resume: <a href="${result?.Location}">${result.Key}</a><br><br>
      Best regards,<br>`,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      res.status(200).json({ msg: "success", status: true });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = CareerRouter;
