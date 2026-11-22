// Rutas de HistorialAcceso - Definicion de endpoints para historial
const express = require('express');
const router = express.Router();
const historialControlador = require('../controladores/HistorialControlador');

// Registrar acceso
router.post('/registrar', historialControlador.registrar);

// Registrar salida
router.post('/salida', historialControlador.registrarSalida);

// Obtener todo el historial
router.get('/obtener', historialControlador.obtenerTodos);

module.exports = router;
