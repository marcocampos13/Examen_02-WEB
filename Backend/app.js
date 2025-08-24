/*
========================================================================================
Centro....: Universidad Técnica Nacional
Sede......: Pacífico
Carrera...: Tecnologías de Información
Curso.....: ITI-523 - Tecnologías y Sistemas Web II
Periodo...: 2-2025
Documento.: Semana 11 - Práctica 03
Tema......: API REST con NodeJS, Express y MongoDB
Objetivos.: Crear una API REST que permita gestionar imágenes almacenadas en MongoDB.          
Profesor..: Jorge Ruiz (york)
Estudiante: Marco Campos Torres
========================================================================================
*/
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
require('./models/mdl_Categories.js');
require('./models/User.js');


const app = express();

/* ============================
   CORS (ajusta origin si aplica)
============================ */
const corsOptions = {
  origin: 'http://localhost:5000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

/* ============================
   Parsers y seguridad
============================ */
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

/* ============================
   Cookie Session
============================ */
const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
const cookieKey = require('./config/cookieSecret.js');
app.use(
  cookieSession({
    name: 'L&E-session',
    keys: [cookieKey],
    httpOnly: true,
    expires: expiryDate,
  })
);

/* ============================
   Conexión MongoDB
============================ */
const dbConfig = require('./config/configDB.js');

// Construir la URI según si hay usuario y contraseña o no
let mongoUri;
if (dbConfig.USER && dbConfig.PASS) {
  mongoUri = `mongodb://${dbConfig.USER}:${dbConfig.PASS}@${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`;
} else {
  mongoUri = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`;
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('MongoDB error de conexión:', err));

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado');
});

/* ============================
   Rutas
============================ */
const indexRouter = require('./routes/rout_Index.js');
const categoriesRouter = require('./routes/rout_Categories.js');
const usersRouter = require('./routes/rout_Users.js');
const workRouter = require('./routes/rout_Work.js');

// ⭐ Nueva ruta de reviews
const reviewRoutes = require("./routes/reviewRoutes");


app.use('/api/trabajos', workRouter);
app.use("/api/reviews", reviewRoutes);  // <-- Montamos el endpoint para reviews

app.use('/', indexRouter);
app.use('/imagenes', categoriesRouter);
app.use('/usuarios', usersRouter);


/* ============================
   Arranque servidor
============================ */
const server = app.listen(5000, () => {
  console.log(`Server escuchando en el puerto ${server.address().port}`);
});

module.exports = app;