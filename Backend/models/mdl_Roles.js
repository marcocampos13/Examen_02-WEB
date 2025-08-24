const mongoose = require('mongoose');

const schRoles = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: Number, required: true },
    description: { type: String, required: true }
});

const Roles = mongoose.model("Roles", schRoles);

module.exports = Roles;