// Controlador de Rol - Clase para manejar la logica de roles
const Rol = require('../modelos/Rol');

class RolControlador {
    // Metodo para obtener todos los roles
    async obtenerTodos(req, res) {
        try {
            const modeloRol = new Rol();
            const roles = await modeloRol.obtenerTodos();
            res.json(roles);
        } catch (error) {
            console.error('Error al obtener roles:', error);
            res.status(500).json({ mensaje: 'Error al obtener roles' });
        }
    }
}

module.exports = new RolControlador();
