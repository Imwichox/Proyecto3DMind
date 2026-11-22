// Clase para la configuracion de la base de datos
const mysql = require('mysql2/promise');

class BaseDatos {
    constructor() {
        this.config = {
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'proyecto_3d_mind'
        };
        this.pool = mysql.createPool(this.config);
    }

    // Metodo para obtener una conexion del pool
    async obtenerConexion() {
        return await this.pool.getConnection();
    }

    // Metodo para cerrar el pool
    async cerrarPool() {
        await this.pool.end();
    }
}

module.exports = new BaseDatos();
