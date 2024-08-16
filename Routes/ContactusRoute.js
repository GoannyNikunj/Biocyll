const express = require("express");
const ContactusRouter = express.Router();
const ContactUsModel = require("../Model/ContactUS");

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

ContactusRouter.post("/api/contactus/post", async (req, res) => {
  const { Name, Email, Phone, Company, Occupation, Message } = req.body;
  try {
    const info = new ContactUsModel(req.body);
    await info.save();

    // Email details
    let mailOptions = {
      from: `"${Name}" <${Email}>`, 
      to: "Inquiry1@biocyll.com",
      subject: "Test Email",
      text: `${Message}`,
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = ContactusRouter;
