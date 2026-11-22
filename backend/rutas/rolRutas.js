// Rutas de Rol - Definicion de endpoints para roles
const express = require('express');
const router = express.Router();
const rolControlador = require('../controladores/RolControlador');

// Obtener todos los roles
router.get('/obtener', rolControlador.obtenerTodos);

module.exports = router;
