const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Prediction = require("../models/prediction");

const upload = multer({
  storage: multer.memoryStorage()
});

router.post("/", upload.single("image"), async (req, res) => {

  try {

    console.log("Incoming file:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    console.log("Image received:", req.file.originalname);

    const formData = new FormData();

    formData.append(
      "file",
      req.file.buffer,
      req.file.originalname
    );

    console.log("Sending to ML API:", process.env.ML_API_URL);

    const response = await axios.post(
      process.env.ML_API_URL,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const result = response.data;

    console.log("ML API Response:", result);

    const newPrediction = new Prediction({
      imageName: req.file.originalname,
      disease: result.disease,
      confidence: result.confidence,
      suggestion: result.suggestion
    });

    await newPrediction.save();

    res.json(result);

  } catch (error) {

    console.error("Prediction error:", error);

    if (error.response) {
      console.error("ML API Error:", error.response.data);
      return res.status(500).json(error.response.data);
    }

    res.status(500).json({
      error: "Prediction failed",
      message: error.message
    });

  }

});

module.exports = router;