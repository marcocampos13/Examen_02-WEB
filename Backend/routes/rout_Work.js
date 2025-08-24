const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { subirTrabajo, listarTrabajos } = require('../controllers/ctrl_Work.js');

// Configuración de multer para guardar PDFs en carpeta "uploads"
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // asegúrate de crear esta carpeta
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // nombre único
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Rutas
router.post('/subir', upload.single('archivoPDF'), subirTrabajo); // subir un trabajo
router.get('/listar', listarTrabajos); // listar trabajos, opcional ?materia=español

module.exports = router;
