// routes/investigationRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { obtenerInvestigaciones } = require('../controllers/investigacionController');

router.get('/', obtenerInvestigaciones);

module.exports = router;
