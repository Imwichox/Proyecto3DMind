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
}

module.exports = TipoDocumento;
