# Semana_11
Semana 11 repositorio original.

# Documentació y aprobación de las pruebas
- https://documenter.getpostman.com/view/45666071/2sB3BEoqSC 

# Guia para el desarrollo de la Practica
Step 01
- Crear carpeta Backend
    - mkdir backend
    - cd backend
- Inicializar el proyecto express
    - npm init -y
Nota: Se tendra que ver lo siguiente:
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}

Step 02
- Instalar las herramientas necesarias
    - npm install --save express http-errors body-parser mongoose cors helmet multer bcryptjs jsonwebtoken cookie-session

## Generar clave secreta segura para la aplicación
- Para proteger sesiones y tokens JWT, necesitas una clave secreta fuerte y aleatoria. Para generarla sigue estos pasos:
  1. Abre la terminal o consola de comandos en tu computadora.
  2. Ejecuta el siguiente comando para generar una clave secreta aleatoria de 64 caracteres hexadecimales:

# ```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Correr el archivo
  - cd backend
  - node app.js
