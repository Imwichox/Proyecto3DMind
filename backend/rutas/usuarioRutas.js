// Rutas de Usuario - Definicion de endpoints para usuarios
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');

// Registrar nuevo usuario
router.post('/registrar', usuarioControlador.registrar);

// Obtener todos los usuarios
router.get('/obtener', usuarioControlador.obtenerTodos);

// Buscar usuarios
router.get('/buscar', usuarioControlador.buscar);

// Actualizar usuario
router.put('/actualizar/:id', usuarioControlador.actualizar);

// Desbloquear usuario
router.put('/desbloquear/:id', usuarioControlador.desbloquear);

// Eliminar usuario
router.delete('/eliminar/:id', usuarioControlador.eliminar);

// Iniciar sesion
router.post('/login', usuarioControlador.iniciarSesion);

module.exports = router;
