// ========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ========================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Token de autenticación requerido'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuario no encontrado'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada'
      });
    }
    
    // Agregar usuario a la request
    req.user = {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      schoolGrade: user.schoolGrade
    };
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autenticación inválido'
      });
    }
    
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error verificando autenticación'
    });
  }
};

// Middleware para verificar si el usuario es admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador'
    });
  }
  next();
};

// Middleware opcional de autenticación (no requiere token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          schoolGrade: user.schoolGrade
        };
      }
    }
    
    next();
    
  } catch (error) {
    // Si hay error con el token opcional, continuar sin usuario
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};