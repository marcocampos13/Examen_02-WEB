const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API viva' });
});


// create listener for GET requests to the root URL
router.get('/', (req, res) => {
    salida = {
        status_code: 200,
        status_message: 'OK',
        content: {
            mensaje: 'Hola Mundo - Practica03 - API REST con NodeJS, Express y MongoDB',
            autor: 'Jorge Ruiz (york)',
            student: "",
            fecha: new Date()
        }
    }
    res.status(200).json(salida);
});

module.exports = router;

