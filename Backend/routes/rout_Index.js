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
            mensaje: 'Examen II',
            autor: 'Jorge Ruiz (york)',
            student: "Marco Campos and Jorjan Alvarado",
            fecha: new Date()
        }
    }
    res.status(200).json(salida);
});

module.exports = router;

