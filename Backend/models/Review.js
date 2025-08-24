// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  investigation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investigation', // Asegúrate que el modelo 'Investigation' exista
    required: true
  },
  explorerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
