// Controlador de TipoDocumento - Clase para manejar la logica de tipos de documento
const TipoDocumento = require('../modelos/TipoDocumento');

class TipoDocumentoControlador {
    // Metodo para obtener todos los tipos de documento
    async obtenerTodos(req, res) {
        try {
            const modeloTipoDoc = new TipoDocumento();
            const tipos = await modeloTipoDoc.obtenerTodos();
            res.json(tipos);
        } catch (error) {
            console.error('Error al obtener tipos de documento:', error);
            res.status(500).json({ mensaje: 'Error al obtener tipos de documento' });
        }
    }
}

module.exports = new TipoDocumentoControlador();
