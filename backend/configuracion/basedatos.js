// Clase para la configuracion de la base de datos
const mysql = require('mysql2/promise');

class BaseDatos {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'proyecto_3d_mind'
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
