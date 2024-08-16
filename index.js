const express = require("express");
const cors = require("cors");
const { connection } = require("./db");
const { userRoute } = require("./Routes/UserRoute");
const { AdminRoute } = require("./Routes/AdminRoute");
const { ProductRouter } = require("./Routes/ProductRoute");
const { CategoryRouter } = require("./Routes/CategoryRoute");
const { CardRouter } = require("./Routes/CardRoute");
const { OrderRouter } = require("./Routes/OrderRoute");
const { Addressrouter } = require("./Routes/AddessRoute");
const ContactusRouter = require("./Routes/ContactusRoute");
const CareerRouter = require("./Routes/CareerRoute");
const BlogRouter = require("./Routes/BlogRoute");
const TeamsRouter = require("./Routes/TeamsRouter");
const ClientRouter = require("./Routes/ClientRoute");
const NewsRouter = require("./Routes/NewsRoute");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

//initial api
app.get("/", async (req, res) => {
  res.send("working");
});

// user api's
app.use("/", userRoute);

//product api's

app.use("/", ProductRouter);
//admin api's
app.use("/", AdminRoute);

//category api's
app.use("/", CategoryRouter);

//card api's
app.use("/", CardRouter);

//order api's
app.use("/", OrderRouter);

//addresses api's
app.use("/", Addressrouter);

//ContactUs api's
app.use("/", ContactusRouter);

//Career api's
app.use("/", CareerRouter);

//Blog api's
app.use("/", BlogRouter);

// Teams api's
app.use("/", TeamsRouter);

// client api's
app.use("/", ClientRouter);

// client api's
app.use("/", NewsRouter);

// server
app.listen(9090, async () => {
  try {
    await connection;
    console.log("connection established");
    console.log("Listening on port", 9090);
  } catch (error) {
    console.log(error);
  }
});

// here i chages somthings
