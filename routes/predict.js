const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Prediction = require("../models/prediction");

const upload = multer();

router.post("/", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const formData = new FormData();

    formData.append(
      "file",
      req.file.buffer,
      req.file.originalname
    );

    const response = await axios.post(
      process.env.ML_API_URL,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    const result = response.data;

    const newPrediction = new Prediction({
      imageName: req.file.originalname,
      disease: result.disease,
      confidence: result.confidence,
      suggestion: result.suggestion
    });

    await newPrediction.save();

    res.json(result);

  } catch (error) {

    console.error("Prediction error:", error.message);

    if (error.response) {
      console.error("ML API Error:", error.response.data);
    }

    res.status(500).json({
      error: "Prediction failed"
    });

  }

});

module.exports = router;