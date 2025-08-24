const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    materia: {
        type: String,
        enum: ['español', 'sociales', 'ciencias', 'matematicas'],
        required: true
    },
    archivoPDF: {
        type: String, // Guardaremos la ruta del PDF
        required: true
    },
    fechaSubida: {
        type: Date,
        default: Date.now
    },
    autor: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Work', workSchema);
