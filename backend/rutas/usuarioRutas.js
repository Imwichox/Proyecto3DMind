// Rutas de Usuario - Definicion de endpoints para usuarios
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');
const verificarAdmin = require('../middleware/verificarAdmin');
const verificarAdminOSelf = require('../middleware/verificarAdminOSelf');

// Perfil del propio usuario autenticado (sin datos de otros usuarios)
router.get('/perfil', usuarioControlador.obtenerPerfil);

// Registrar nuevo usuario
router.post('/registrar', verificarAdmin, usuarioControlador.registrar);

// Obtener todos los usuarios
router.get('/obtener', verificarAdmin, usuarioControlador.obtenerTodos);

// Buscar usuarios
router.get('/buscar', verificarAdmin, usuarioControlador.buscar);

// Actualizar usuario (admin o el propio usuario)
router.put('/actualizar/:id', verificarAdminOSelf, usuarioControlador.actualizar);

// Desbloquear usuario
router.put('/bloquear/:id', verificarAdmin, usuarioControlador.bloquear);

router.put('/desbloquear/:id', verificarAdmin, usuarioControlador.desbloquear);

// Eliminar usuario
router.delete('/eliminar/:id', verificarAdmin, usuarioControlador.eliminar);

// Iniciar sesion
router.post('/login', usuarioControlador.iniciarSesion);

module.exports = router;
