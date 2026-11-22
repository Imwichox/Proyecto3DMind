// Modelo de Rol - Clase para gestionar roles
const bd = require('../configuracion/basedatos');

class Rol {
    constructor(datos = {}) {
        this.id_rol = datos.id_rol || null;
        this.nombre_rol = datos.nombre_rol || '';
        this.descripcion = datos.descripcion || '';
    }

    // Metodo para obtener todos los roles
    async obtenerTodos() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query('SELECT * FROM rol ORDER BY id_rol');
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para verificar si hay roles
    async hayRoles() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query('SELECT COUNT(*) as total FROM rol');
            conexion.release();
            return filas[0].total > 0;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para insertar roles basicos
    async insertarBasicos() {
        try {
            const conexion = await bd.obtenerConexion();
            await conexion.query('INSERT INTO rol (nombre_rol, descripcion) VALUES (?, ?)', ['Administrador', 'Acceso total al sistema']);
            await conexion.query('INSERT INTO rol (nombre_rol, descripcion) VALUES (?, ?)', ['Operario de tienda', 'Acceso limitado a operaciones de tienda']);
            conexion.release();
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Rol;
