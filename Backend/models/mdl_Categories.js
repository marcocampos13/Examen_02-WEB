// models/mdl_Categories.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' },
  tags:     [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Categories', categorySchema);
