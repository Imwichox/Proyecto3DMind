// Middleware de verificacion de rol - Solo permite acceso al Administrador (id_rol = 1)
const Usuario = require('../modelos/Usuario');

async function verificarAdmin(req, res, next) {
    try {
        const idUsuario = req.headers['x-id-usuario'] || req.query.id_usuario ||
            (req.body && req.body.id_usuario);

        if (!idUsuario) {
            return res.status(403).json({ mensaje: 'Acceso denegado: se requiere una sesion activa' });
        }

        const modeloUsuario = new Usuario();
        const usuario = await modeloUsuario.obtenerPorId(idUsuario);

        if (!usuario || usuario.id_rol_FK !== 1) {
            return res.status(403).json({ mensaje: 'Acceso denegado: solo el administrador puede gestionar usuarios' });
        }

        next();
    } catch (error) {
        console.error('Error en verificacion de rol:', error);
        res.status(500).json({ mensaje: 'Error al verificar permisos' });
    }
}

module.exports = verificarAdmin;
