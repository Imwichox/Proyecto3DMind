// Controlador de HistorialAcceso - Clase para manejar la logica del historial
const HistorialAcceso = require('../modelos/HistorialAcceso');

class HistorialControlador {
    // Metodo para registrar un acceso
    async registrar(req, res) {
        try {
            const { id_usuario, ip } = req.body;
            const modeloHistorial = new HistorialAcceso();
            const idSesion = await modeloHistorial.crear(id_usuario, ip);
            res.json({ mensaje: 'Acceso registrado', id_sesion: idSesion });
        } catch (error) {
            console.error('Error al registrar acceso:', error);
            res.status(500).json({ mensaje: 'Error al registrar acceso' });
        }
    }

    // Metodo para registrar cierre de sesion
    async registrarSalida(req, res) {
        try {
            const { id_sesion } = req.body;
            const modeloHistorial = new HistorialAcceso();
            await modeloHistorial.actualizarSalida(id_sesion);
            res.json({ mensaje: 'Salida registrada' });
        } catch (error) {
            console.error('Error al registrar salida:', error);
            res.status(500).json({ mensaje: 'Error al registrar salida' });
        }
    }

    // Metodo para obtener todo el historial
    async obtenerTodos(req, res) {
        try {
            const modeloHistorial = new HistorialAcceso();
            const historial = await modeloHistorial.obtenerTodos();
            res.json(historial);
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ mensaje: 'Error al obtener historial' });
        }
    }
}

module.exports = new HistorialControlador();
