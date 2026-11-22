// Modelo de HistorialAcceso - Clase para gestionar el historial de accesos
const bd = require('../configuracion/basedatos');

class HistorialAcceso {
    constructor(datos = {}) {
        this.id_sesion = datos.id_sesion || null;
        this.fecha_ingreso = datos.fecha_ingreso || null;
        this.fecha_salida = datos.fecha_salida || null;
        this.ip_acceso = datos.ip_acceso || '';
        this.id_usuario_FK = datos.id_usuario_FK || null;
    }

    // Metodo para registrar un nuevo acceso
    async crear(idUsuario, ip) {
        try {
            const conexion = await bd.obtenerConexion();
            const fechaActual = new Date();
            const [resultado] = await conexion.query(
                'INSERT INTO historial_acceso (fecha_ingreso, ip_acceso, id_usuario_FK) VALUES (?, ?, ?)',
                [fechaActual, ip, idUsuario]
            );
            conexion.release();
            return resultado.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para actualizar la fecha de salida
    async actualizarSalida(idSesion) {
        try {
            const conexion = await bd.obtenerConexion();
            const fechaActual = new Date();
            await conexion.query(
                'UPDATE historial_acceso SET fecha_salida = ? WHERE id_sesion = ?',
                [fechaActual, idSesion]
            );
            conexion.release();
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para obtener el historial de un usuario
    async obtenerPorUsuario(idUsuario) {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT * FROM historial_acceso WHERE id_usuario_FK = ? ORDER BY fecha_ingreso DESC',
                [idUsuario]
            );
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para obtener todo el historial
    async obtenerTodos() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT h.*, u.nombre, u.username FROM historial_acceso h JOIN usuario u ON h.id_usuario_FK = u.id_usuario ORDER BY h.fecha_ingreso DESC'
            );
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = HistorialAcceso;
