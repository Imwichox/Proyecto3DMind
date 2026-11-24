// Middleware de verificacion de rol - Administrador (id_rol = 1) o el propio usuario editandose
const Usuario = require('../modelos/Usuario');

async function verificarAdminOSelf(req, res, next) {
    try {
        const idUsuario = req.headers['x-id-usuario'] || req.query.id_usuario ||
            (req.body && req.body.id_usuario);

        if (!idUsuario) {
            return res.status(403).json({ mensaje: 'Acceso denegado: se requiere una sesion activa' });
        }

        const modeloUsuario = new Usuario();
        const usuario = await modeloUsuario.obtenerPorId(idUsuario);

        if (!usuario) {
            return res.status(403).json({ mensaje: 'Acceso denegado: sesion no valida' });
        }

        // Admin siempre puede; un usuario normal solo sobre si mismo (req.params.id)
        if (usuario.id_rol_FK !== 1 && String(usuario.id_usuario) !== String(req.params.id)) {
            return res.status(403).json({ mensaje: 'Acceso denegado: solo el administrador puede gestionar usuarios' });
        }

        next();
    } catch (error) {
        console.error('Error en verificacion de rol:', error);
        res.status(500).json({ mensaje: 'Error al verificar permisos' });
    }
}

module.exports = verificarAdminOSelf;
