const express = require("express");
const router = express.Router();
const { addReview, getReviewsByInvestigation } = require("../controllers/reviewController");

router.post("/", addReview);
router.get("/:investigationId", getReviewsByInvestigation);

module.exports = router;
