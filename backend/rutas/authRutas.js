// Rutas de autenticacion - Endpoints de seguridad y sesion
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/UsuarioControlador');

// Estado de configuracion inicial (si no hay usuarios, habilita el setup del admin)
router.get('/setup-status', usuarioControlador.setupStatus);

// Registrar el primer administrador del sistema
router.post('/setup-admin', usuarioControlador.setupAdmin);

// Cambiar contraseña (obligatorio al ingresar con la clave por defecto)
router.put('/cambiar-password', usuarioControlador.cambiarPassword);

// Verificar contrasena de administrador (doble verificacion de acciones)
router.post('/verificar-admin', usuarioControlador.verificarAdminPassword);

// Cerrar sesion (limpia el token en memoria)
router.post('/logout', usuarioControlador.logout);

module.exports = router;
