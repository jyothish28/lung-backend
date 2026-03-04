const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({

imageName: String,

disease: String,

confidence: Number,

suggestion: String,

date: {

type: Date,

default: Date.now

}

});

module.exports = mongoose.model("Prediction", predictionSchema);