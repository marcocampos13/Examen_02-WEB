const express = require('express');
const multer = require('multer');
const { getCategories, getCategoriesFoto, addCategories } = require('../controllers/ctrl_Categories.js');
const { verifyToken, checkRoles } = require('../middleware/func_Users.js');

const router = express.Router();
const upload = multer({ dest: 'subirfoto/' });

// Montado en /imagenes desde app.js
router.get('/foto/:id', getCategoriesFoto);
router.get('/:id', getCategories);
router.post(
  '/',
  verifyToken,
  checkRoles(['user', 'root']),
  upload.array('imagen', 1),
  addCategories
);

module.exports = router;