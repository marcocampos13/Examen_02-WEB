const secret = require('../config/configSecret.js');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Importa el modelo correctamente

const signup = async (req, res) => {
  try {
    const user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      rol: req.body.rol,
      schoolGrade: req.body.schoolGrade,
      description: req.body.description,
      photo: req.body.photo,
      isActive: true
    });

    await user.save();

    console.log('Usuario registrado exitosamente!');
    res.status(200).json({
      status_code: 200,
      status_message: 'OK',
      body_message: 'Usuario registrado exitosamente!',
    });
  } catch (err) {
    console.error('Error al registrar al usuario:', err);
    res.status(500).json({
      status_code: 500,
      status_message: 'Server error',
      body_message: err.message || err,
    });
  }
};

const signin = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        status_message: 'Not found',
        body_message: 'El usuario no existe...!',
      });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        status_code: 401,
        status_message: 'Unauthorized',
        body_message: 'Contraseña Incorrecta...!',
      });
    }

    const token = jsonwebtoken.sign({ id: user._id }, secret, { expiresIn: 86400 });

    const nivel = user.rol ? user.rol.toUpperCase() : '';
    req.session.token = token;

    res.status(200).json({
      status_code: 200,
      status_message: 'Ok',
      body_message: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: nivel,
      },
    });
  } catch (err) {
    console.error('Error en iniciar sesión:', err);
    res.status(500).json({
      status_code: 500,
      status_message: 'Internal Server Error',
      body_message: err.message || err,
    });
  }
};

const signout = async (req, res) => {
  try {
    req.session = null;
    console.log('El usuario cerro sesión Satisfactoriamente...!');
    res.status(200).json({
      status_code: 200,
      status_message: 'OK',
      body_message: 'El usuario cerro sesión Satisfactoriamente...!',
    });
  } catch (err) {
    console.error('Error en cerrar sesión:', err);
    res.status(500).json({
      status_code: 500,
      status_message: 'Error en cerrar sesión',
      body_message: err.message || err,
    });
  }
};

module.exports = {
  signup,
  signin,
  signout,
};