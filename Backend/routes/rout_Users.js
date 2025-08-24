const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  signup,
  signin,
  signout
} = require('../controllers/ctrl_Users.js');
const {
  verifyToken,
  verifyRol,
  verifyDuplicates,
  isRoot,
  isAdmin,
  isUser
} = require('../middleware/func_Users.js');

const router = express.Router();

// Rutas de autenticación personalizadas (controlador)
router.post('/signup', [verifyToken, isRoot, verifyDuplicates, verifyRol], signup);
router.post('/signin', signin);
router.post('/signout', signout);

// Registro de usuario (directo)
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, schoolGrade, description, photo, role } = req.body;

    if (!fullName || !email || !password || !schoolGrade || !description) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: passwordHash,
      schoolGrade,
      description,
      photo,
      role: role && ['researcher', 'admin'].includes(role) ? role : 'researcher',
      isActive: true
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado',
      data: user // gracias a toJSON no incluye password
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Error de validación', details: errors });
    }
    res.status(500).json({ error: 'Error registrando usuario', details: err.message });
  }
});

// Login por email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const user = await User.findOne({ email, isActive: true });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Guarda algo simple en cookie-session (si lo deseas, luego migra a JWT)
    req.session.user = { id: user._id, email: user.email, role: user.role, fullName: user.fullName };

    res.json({ success: true, message: 'Login ok', data: user });
  } catch (err) {
    res.status(500).json({ error: 'Error en login', details: err.message });
  }
});

// Perfil (requiere sesión simple)
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user)
    return res.status(401).json({ error: 'No autenticado' });

  res.json({ success: true, data: req.session.user });
});

// Logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true, message: 'Sesión cerrada' });
});

module.exports = router;