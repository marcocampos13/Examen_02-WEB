const mongoose = require('mongoose');
const secret = require('../config/configSecret.js');
const jsonwebtoken = require('jsonwebtoken');
const ROLES = ['admin', 'user', 'guest', 'root'];
const User = require('../models/User'); // Importa el modelo correctamente

const verifyToken = (req, res, next) => {
  const token = req.session?.token;
  if (!token) {
    return res.status(403).json({
      status_code: 403,
      status_message: 'Forbidden',
      body_message: 'No hay usuario autenticado. Debe iniciar sesión primero.',
    });
  }

  jsonwebtoken.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        status_message: 'Unauthorized',
        body_message: 'El usuario no es autorizado. El token es inválido o ha expirado.',
      });
    }
    req.UserID = decoded.id;
    next();
  });
};

const verifyRol = (req, res, next) => {
  if (req.body.rol) {
    if (!ROLES.includes(req.body.rol)) {
      return res.status(400).json({
        status_code: 400,
        status_message: 'Bad request',
        body_message: 'El rol no es válido.',
      });
    }
  }
  next();
};

const verifyDuplicates = async (req, res, next) => {
  try {
    const userByUsername = await User.findOne({ username: req.body.username });
    if (userByUsername) {
      return res.status(400).json({
        status_code: 400,
        status_message: 'Bad request',
        body_message: 'Error! Nombre de usuario ya existe.',
      });
    }

    const userByEmail = await User.findOne({ email: req.body.email });
    if (userByEmail) {
      return res.status(400).json({
        status_code: 400,
        status_message: 'Bad request',
        body_message: 'Error! correo electrónico ya existe.',
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      status_code: 500,
      status_message: 'Internal server error',
      body_message: err.message || err,
    });
  }
};

// Middleware para validar que el rol sea uno de los permitidos (array de roles)
const checkRoles = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.UserID);
      if (!user) {
        return res.status(404).json({
          status_code: 404,
          status_message: 'Not Found',
          body_message: 'Usuario no autorizado.',
        });
      }

      if (roles.includes(user.rol)) {
        return next();
      }

      return res.status(403).json({
        status_code: 403,
        status_message: 'Forbidden',
        body_message: 'El usuario no tiene los permisos necesarios para acceder a este recurso.',
      });
    } catch (error) {
      return res.status(500).json({
        status_code: 500,
        status_message: 'Internal Server Error',
        body_message: error.message || error,
      });
    }
  };
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.UserID);
    if (user?.rol === 'admin') {
      return next();
    }
    return res.status(403).json({
      status_code: 403,
      status_message: 'Forbidden',
      body_message: 'El usuario no tiene los permisos necesarios para acceder a este recurso.',
    });
  } catch (err) {
    return res.status(500).json({
      status_code: 500,
      status_message: 'Internal Server Error',
      body_message: err.message || err,
    });
  }
};

const isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.UserID);
    if (user?.rol === 'user') {
      return next();
    }
    return res.status(403).json({
      status_code: 403,
      status_message: 'Forbidden',
      body_message: 'El usuario no tiene los permisos necesarios para acceder a este recurso.',
    });
  } catch (err) {
    return res.status(500).json({
      status_code: 500,
      status_message: 'Internal Server Error',
      body_message: err.message || err,
    });
  }
};

const isRoot = async (req, res, next) => {
  try {
    const user = await User.findById(req.UserID);
    if (user?.rol === 'root') {
      return next();
    }
    return res.status(403).json({
      status_code: 403,
      status_message: 'Forbidden',
      body_message: 'El usuario no tiene los permisos necesarios para acceder a este recurso.',
    });
  } catch (err) {
    return res.status(500).json({
      status_code: 500,
      status_message: 'Internal Server Error',
      body_message: err.message || err,
    });
  }
};

// Funciones auxiliares para usuarios
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function createUser(data) {
  const { fullName, email, passwordHash, schoolGrade, description, photo, role } = data;

  const exists = await User.findOne({ email });
  if (exists) throw new Error('El email ya está registrado');

  const user = new User({
    fullName,
    email,
    password: passwordHash,
    schoolGrade,
    description,
    photo,
    role: role || 'researcher',
    isActive: true
  });

  return user.save();
}

module.exports = {
  verifyToken,
  verifyRol,
  verifyDuplicates,
  checkRoles,
  isAdmin,
  isUser,
  isRoot,
  getUserByEmail,
  createUser
};