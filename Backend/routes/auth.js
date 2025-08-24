// ========================================
// RUTAS DE AUTENTICACIÓN
// ========================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// ========================================
// POST /api/auth/register - Registrar nuevo usuario
// ========================================
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      schoolGrade, 
      description, 
      photo 
    } = req.body;

    // Validaciones básicas
    if (!fullName || !email || !password || !schoolGrade || !description) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Todos los campos son requeridos: fullName, email, password, schoolGrade, description'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña muy corta',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario registrado con este email'
      });
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      schoolGrade,
      description: description.trim(),
      photo: photo || 'https://via.placeholder.com/150x150?text=Sin+Foto',
      role: 'researcher'
    });

    // Guardar usuario
    const savedUser = await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'investigaciones-utn',
        audience: 'estudiantes'
      }
    );

    res.status(201).json({
      success: true,
      message: '✅ Usuario registrado exitosamente',
      token,
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        schoolGrade: savedUser.schoolGrade,
        description: savedUser.description,
        photo: savedUser.photo,
        role: savedUser.role,
        createdAt: savedUser.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);

    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Error de validación',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Ocurrió un error interno del servidor'
    });
  }
});

// ========================================
// POST /api/auth/login - Iniciar sesión
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'investigaciones-utn',
        audience: 'estudiantes'
      }
    );

    // Actualizar última fecha de login (opcional)
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: '✅ Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        schoolGrade: user.schoolGrade,
        description: user.description,
        photo: user.photo,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Ocurrió un error interno del servidor'
    });
  }
});

// ========================================
// GET /api/auth/profile - Obtener perfil del usuario autenticado
// ========================================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'No se encontró el usuario'
      });
    }

    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      user: user
    });

  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error obteniendo el perfil del usuario'
    });
  }
});

// ========================================
// PUT /api/auth/profile - Actualizar perfil del usuario
// ========================================
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, description, photo, schoolGrade } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (description) updateData.description = description.trim();
    if (photo) updateData.photo = photo;
    if (schoolGrade) updateData.schoolGrade = schoolGrade;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.json({
      success: true,
      message: '✅ Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Error de validación',
        details: errors
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error actualizando el perfil'
    });
  }
});

// ========================================
// POST /api/auth/verify-token - Verificar si el token es válido
// ========================================
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

module.exports = router;