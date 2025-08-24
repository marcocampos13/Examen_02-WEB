// controllers/reviewController.js
const Review = require("../models/Review");

// Crear reseña
const addReview = async (req, res) => {
  try {
    const { investigationId, explorerName, rating, comment } = req.body;

    const review = new Review({
      investigation: investigationId,
      explorerName,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({ message: "Review creada exitosamente", review });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la review", details: error.message });
  }
};

// Obtener reseñas por investigación
const getReviewsByInvestigation = async (req, res) => {
  try {
    const { investigationId } = req.params;
    const reviews = await Review.find({ investigation: investigationId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las reviews", details: error.message });
  }
};

module.exports = { addReview, getReviewsByInvestigation };
