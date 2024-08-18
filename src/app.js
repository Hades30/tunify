const express = require("express");
const cors = require("cors");
const config = require("./config/config");
var cookieParser = require("cookie-parser");
require("dotenv").config();

const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://tanishkumar30:C4rVazxtlcby5Dwi@tunifycluster.z5m9oud.mongodb.net/?retryWrites=true&w=majority&appName=TunifyCluster`,
      {
        useNewUrlParser: true,
        dbName: "Tunify",
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
// Define your routes here

const authorizationRoutes = require("./routes/authorization.js");
const userRoutes = require("./routes/userDetails.js");
const activityRoutes = require("./routes/activity.js");

app.use("/api/auth", authorizationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/activity", activityRoutes);

app.get("/", (req, res) => {
  console.log("hello world");
  res.send("hello world");
});

// Start the server
connectDB();

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
