const fs = require('node:fs');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Categories = mongoose.model('Categories');

// create a middleware to upload files
const multer = require("multer");
const subir = multer({ dest: "subirfoto/" });

router.get('/imagenes/:id', async function obtenerCategoria(req, res) {
    const id = req.params.id;
    try {
        const categoria = await Categories.findOne({ CategoryID: id });
        if (!categoria) {
            return res.status(404).json({
                status_code: 404,
                status_message: "Not Found",
                content: { error: "Categoría no encontrada" }
            });
        }

        res.status(200).json({
            status_code: 200,
            status_message: "OK",
            content: {
                resultado: {
                    CategoryID: categoria.CategoryID,
                    CategoryName: categoria.CategoryName,
                    Description: categoria.Description,
                    Mime: categoria.Mime,
                    Image: categoria.Image.toString("base64") // Convertir la imagen a Base64
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            status_message: "Internal Server Error",
            content: { error: error.toString() }
        });
    }
});

router.get('/foto/:id', async function obtenerImagenMongo(req, res) {
    const id = req.params.id;

    try {
        const categoria = await Categories.findOne({ CategoryID: id });

        if (!categoria || !categoria.Image) {
            return res.status(404).json({
                status_code: 404,
                status_message: "Not Found",
                content: { error: "Imagen no encontrada" }
            });
        }
        res.writeHead(200, {
            "Content-Type": categoria.Mime,
            "Content-Length": categoria.Image.length
        });
        res.end(categoria.Image);

    } catch (error) {
        res.status(500).json({
            status_code: 500,
            status_message: "Internal Server Error",
            content: { error: error.toString() }
        });
    }
});

router.post("/imagenes", subir.array("imagen", 1), async function subirFoto(req, res) {
    try {
        // obtener los valores del body
        const { id, nombre, descripcion } = req.body;
        const imagenBuffer = fs.readFileSync(req.files[0].path);
        const mime = req.files[0].mimetype;

        // crear el documento para MongoDB
        const nuevaCategoria = new Categories({
            CategoryID: id,
            CategoryName: nombre,
            Description: descripcion,
            Image: imagenBuffer,
            Mime: mime
        });

        await nuevaCategoria.save();

        // eliminar el archivo temporal
        fs.unlinkSync(req.files[0].path);

        res.status(200).json({
            status_code: 200,
            status_message: 'OK',
            content: {
                resultado: 'Categoría guardada correctamente'
            }
        });
    } catch (error) {

        // eliminar el archivo temporal si existe
        if (req.files && req.files[0] && fs.existsSync(req.files[0].path)) {
            fs.unlinkSync(req.files[0].path);
        }
        res.status(500).json({
            status_code: 500,
            status_message: 'Internal Server Error',
            content: { error: error.toString() }
        });
    }
});

module.exports = router;