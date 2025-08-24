// ========================================
// MODELO DE USUARIO
// ========================================
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true, // Esto ya crea el índice único
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  schoolGrade: {
    type: String,
    required: [true, 'El grado escolar es requerido'],
    trim: true,
    enum: {
      values: [
        '7° Año', '8° Año', '9° Año', '10° Año', '11° Año', '12° Año',
        'Universidad 1° Año', 'Universidad 2° Año', 'Universidad 3° Año',
        'Universidad 4° Año', 'Universidad 5° Año', 'Posgrado'
      ],
      message: 'Grado escolar no válido'
    }
  },
  description: {
    type: String,
    required: [true, 'La descripción "¿Quién soy?" es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  photo: {
    type: String,
    default: 'https://via.placeholder.com/150x150?text=Sin+Foto'
  },
  role: {
    type: String,
    enum: ['researcher', 'admin'],
    default: 'researcher'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Índices adicionales (no dupliques el de email)
UserSchema.index({ schoolGrade: 1 });
UserSchema.index({ createdAt: -1 });

// Ocultar password en JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema); // 👈 NOMBRE: 'User' (singular)