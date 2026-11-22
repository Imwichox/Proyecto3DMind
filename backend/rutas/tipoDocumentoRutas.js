// Rutas de TipoDocumento - Definicion de endpoints para tipos de documento
const express = require('express');
const router = express.Router();
const tipoDocumentoControlador = require('../controladores/TipoDocumentoControlador');

// Obtener todos los tipos de documento
router.get('/obtener', tipoDocumentoControlador.obtenerTodos);

module.exports = router;
