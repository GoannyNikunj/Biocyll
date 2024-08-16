const express = require("express");
const ProductRouter = express.Router();
const { Product } = require("../Model/Product");
const { authentication } = require("../Middlewares/Authentication");
const { authrised } = require("../Middlewares/authrise");

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
// Create a product
// ProductRouter.post(
//   "/api/create/product",
//   upload.array("images"),
//   async (req, res) => {
//     try {
//       const payload = JSON.parse(JSON.stringify(req.body));

//       const files = req.files;
//       // Upload files to S3
//       const uploadPromises = files.map(async (file) => {
//         const params = {
//           Bucket: "cricstar",
//           Key: `${uuid.v4()}-${file.originalname}`,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//           ContentDisposition: "inline",
//         };

//         const result = await s3.upload(params).promise();
//         return result;
//       });

//       const result = await Promise.all(uploadPromises);
//       const urls = result.map((image) => image.Location);

//       const images = files.map((file, index) => ({
//         name: file.originalname,
//         url: urls[index],
//       }));
//       // Save product details to the database
//       const product = new Product({ ...payload, images: images });

//       await product.save();

//       res.status(200).json({ message: "Product uploaded successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

ProductRouter.post("/api/upload/file",upload.single("file"),async (req, res) => {
  const file = req.file;
  // console.log(file);
  try {
    const result = await uploadToS3(file)
    res.status(200).send(result.Location);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
})

ProductRouter.post("/api/create/product", async (req, res) => {
  try {
    const payload = req.body;
    const product = new Product(payload);
    await product.save();
    res.status(200).json({ message: "Product uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update product fields and specific image
ProductRouter.put(
  "/api/update/product/:id",
  upload.single("images"),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const payload = JSON.parse(JSON.stringify(req.body));
      const file = req.file;

      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update specific fields if present in the payload
      if (payload.title) {
        existingProduct.title = payload.title;
      }
      if (payload.description) {
        existingProduct.description = payload.description;
      }
      if (payload.price) {
        existingProduct.price = payload.price;
      }
      if (payload.Category) {
        existingProduct.Category = payload.Category;
      }
      if (payload.stock) {
        existingProduct.stock = payload.stock;
      }
      // Add more fields to update as needed

      // Update specific image if present in the request
      if (file) {
        const imageIndex = payload.imageIndex;

        if (
          imageIndex !== undefined &&
          imageIndex >= 0 &&
          imageIndex < existingProduct.images.length
        ) {
          // Delete the existing image from S3
          const existingImageUrl = existingProduct.images[imageIndex].url;
          const existingImageKey = existingImageUrl.split("/").pop();
          
          await s3
            .deleteObject({ Bucket: "biocyll", Key: `biocyll/${existingImageKey}` })
            .promise();

          // Upload the new image to S3
          const params = {
            Bucket: "biocyll",
            Key: `biocyll/${Date.now()}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: "inline",
          };
          const uploadResult = await s3.upload(params).promise();

          // Update the image URL in the product
          existingProduct.images[imageIndex].url = uploadResult.Location;

        } else {
          return res.status(400).json({
            message: "Invalid image index or image index not provided",
          });
        }
      }

      await existingProduct.save();

      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Delete a specific image from a product
ProductRouter.delete(
  "/api/delete/product/:id/image/:imageIndex",
  async (req, res) => {
    try {
      const productId = req.params.id;
      const imageIndex = req.params.imageIndex;

      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (imageIndex < 0 || imageIndex >= existingProduct.images.length) {
        return res.status(404).json({ message: "Invalid image index" });
      }

      // Delete the image from S3
      const imageUrl = existingProduct.images[imageIndex].url;
      const imageKey = imageUrl.split("/").pop();
      await s3.deleteObject({ Bucket: "biocyll", Key: `biocyll/${imageKey}` }).promise();

      // Remove the image from the product's images array
      existingProduct.images.splice(imageIndex, 1);

      await existingProduct.save();

      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Get all products
// Get all products
ProductRouter.get("/api/get/all/products", async (req, res) => {
  const { categoryId,type,priceRange } = req.query;
  try {
    const query = {}
    if (categoryId){
      query.Category = categoryId;
    }
    if (type){
      query.type = type;
    }
    if (priceRange == "asc") {
      const products = await Product.find(query).populate("Category").sort({price:1});
      return res.json(products);
    } else if(priceRange == "desc") {
      const products = await Product.find(query).populate("Category").sort({price:-1});
      return res.json(products);
    } else {
      const products = await Product.find(query).populate("Category");
      return res.json(products);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get a specific product by ID
ProductRouter.get(
  "/api/get/product/:id",

  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate(
        "Category"
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Delete a product by ID
ProductRouter.delete(
  "/api/delete/product/:id",
  authentication,

  async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// add reviews
ProductRouter.patch("/add-review/:id", authentication, async (req, res) => {
  const { text, rating } = req.body;
  const user = req.user.username;
  try {
    const payload = {
      name: user,
      review: text,
      rating:Number(rating),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { reviews: payload } },
      { new: true }
    );
    const totalRatings = updatedProduct.reviews.reduce(
      (acc, review) => acc + Number(review.rating),
      0
    );
    let avgRating = totalRatings / updatedProduct.reviews.length;
    avgRating = avgRating.toFixed(2);

    const newProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { averageRating: Number(avgRating) },
      { new: true }
    );
    res
      .status(200)
      .send({ msg: "Review added successfully!", vendor: newProduct });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

ProductRouter.get("/api/search/products", async (req, res) => {
  console.log("ProductRouter")
  try {
    const search = req.query.search;
    console.log("sdssdsdiudhasjkhdjkas",req.query);
    if (search && search.length > 0) {
      
      const response = await Product.find({ title: { $regex: search, $options: "i" } });
      if (response.length > 0) {
        return res.status(200).send(response); // Sending found products
      } else {
        return res.status(404).send("No products found matching the search query.");
      }
    } else {
      return res.status(400).send("Please provide a valid search query.");
    }

  } catch (error) {
    res.status(500).send(error.message); // Internal server error
  }
});



module.exports = {
  ProductRouter,
};
