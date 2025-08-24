const mongoose = require('mongoose');
const investigacionSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    materia: { type: String, required: true }, // p.ej. "ciencias"
    autor: {
      nombre: { type: String, required: true },
      grado: { type: String, required: true } // p.ej. "licenciatura" o "5"
    },
    fecha: { type: Date, default: Date.now }
  },
  { collection: 'works' } // 👈 fuerza el nombre correcto
);

module.exports = mongoose.model('Investigacion', investigacionSchema); 