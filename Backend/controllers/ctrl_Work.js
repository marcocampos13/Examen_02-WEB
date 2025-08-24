const Work = require('../models/mdl_Work');
const path = require('path');
const fs = require('fs');

// Subir trabajo PDF
const subirTrabajo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status_code: 400,
                status_message: "Bad request",
                body_message: "No se subió ningún archivo PDF"
            });
        }

        const { titulo, materia, autor } = req.body;
        if (!titulo || !materia || !autor) {
            return res.status(400).json({
                status_code: 400,
                status_message: "Bad request",
                body_message: "Faltan datos obligatorios: titulo, materia o autor"
            });
        }

        const newWork = new Work({
            titulo,
            materia,
            autor,
            archivoPDF: req.file.filename // nombre del archivo guardado
        });

        await newWork.save();

        return res.status(201).json({
            status_code: 201,
            status_message: "Created",
            body_message: newWork
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status_message: "Internal Server Error",
            body_message: error.message
        });
    }
};

// Listar trabajos (opcional filtro por materia)
const listarTrabajos = async (req, res) => {
    try {
        const materia = req.query.materia; // ejemplo: ?materia=español
        let trabajos;

        if (materia) {
            trabajos = await Work.find({ materia });
        } else {
            trabajos = await Work.find();
        }

        return res.status(200).json({
            status_code: 200,
            status_message: "OK",
            body_message: trabajos
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            status_message: "Internal Server Error",
            body_message: error.message
        });
    }
};

module.exports = {
    subirTrabajo,
    listarTrabajos
};
