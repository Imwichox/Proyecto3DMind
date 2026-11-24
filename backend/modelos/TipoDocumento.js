// Modelo de TipoDocumento - Clase para gestionar tipos de documento
const bd = require('../configuracion/basedatos');

class TipoDocumento {
    constructor(datos = {}) {
        this.id_tipo_doc = datos.id_tipo_doc || null;
        this.nom_tipo_doc = datos.nom_tipo_doc || '';
        this.sigla = datos.sigla || '';
    }

    // Metodo para obtener todos los tipos de documento
    async obtenerTodos() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query('SELECT * FROM tipo_documento ORDER BY id_tipo_doc');
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para verificar si hay tipos de documento
    async hayTipos() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query('SELECT COUNT(*) as total FROM tipo_documento');
            conexion.release();
            return filas[0].total > 0;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para insertar los tipos de documento basicos
    async insertarBasicos() {
        try {
            const conexion = await bd.obtenerConexion();
            await conexion.query('INSERT INTO tipo_documento (nom_tipo_doc, sigla) VALUES (?, ?)', ['Cédula de Ciudadanía', 'CC']);
            await conexion.query('INSERT INTO tipo_documento (nom_tipo_doc, sigla) VALUES (?, ?)', ['Tarjeta de Identidad', 'TI']);
            await conexion.query('INSERT INTO tipo_documento (nom_tipo_doc, sigla) VALUES (?, ?)', ['Cédula de Extranjería', 'CE']);
            conexion.release();
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TipoDocumento;
