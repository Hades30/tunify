const express = require("express");
const router = express.Router();
const exampleController = require("../controllers/controllers.js");

// Define your routes
router.get("/", exampleController.getExamples);
router.post("/", exampleController.createExample);
// Add more routes as needed

module.exports = router;
