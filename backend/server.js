// Servidor principal - Clase para iniciar el servidor Express
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const Rol = require('./modelos/Rol');
const TipoDocumento = require('./modelos/TipoDocumento');

class Servidor {
    constructor() {
        this.app = express();
        this.puerto = 3000;
        this.configurarMiddleware();
        this.configurarRutas();
    }

    // Metodo para configurar middleware
    configurarMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());

        // Anti-cache: evitar que el navegador guarde paginas o respuestas de API en BFCache/cache
        this.app.use((req, res, next) => {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next();
        });

        this.app.use(express.static(path.join(__dirname, '../frontend')));
    }

    // Metodo para configurar rutas
    configurarRutas() {
        // Rutas de API
        this.app.use('/api/usuarios', require('./rutas/usuarioRutas'));
        this.app.use('/api/historial', require('./rutas/historialRutas'));
        this.app.use('/api/roles', require('./rutas/rolRutas'));
        this.app.use('/api/tipos-documento', require('./rutas/tipoDocumentoRutas'));
        this.app.use('/api/auth', require('./rutas/authRutas'));

        // Ruta principal - sirve index.html
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        // Rutas para las paginas
        this.app.get('/login.html', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/login.html'));
        });

        this.app.get('/panel.html', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/panel.html'));
        });
    }

    // Metodo para inicializar datos del sistema (solo catalogos base, nunca usuarios)
    async inicializarDatos() {
        try {
            const modeloRol = new Rol();
            const modeloTipoDoc = new TipoDocumento();
            const bd = require('./configuracion/basedatos');

            // Verificar si hay roles, si no, insertar los basicos
            const hayRoles = await modeloRol.hayRoles();
            if (!hayRoles) {
                console.log('Insertando roles basicos...');
                await modeloRol.insertarBasicos();
            }

            // Verificar si hay tipos de documento, si no, insertar los basicos
            const hayTipos = await modeloTipoDoc.hayTipos();
            if (!hayTipos) {
                console.log('Insertando tipos de documento basicos...');
                await modeloTipoDoc.insertarBasicos();
            }

            // Asegurar la columna de primer ingreso en la tabla usuario
            const conexion = await bd.obtenerConexion();
            const [columna] = await conexion.query("SHOW COLUMNS FROM usuario LIKE 'debe_cambiar_password'");
            if (columna.length === 0) {
                await conexion.query('ALTER TABLE usuario ADD COLUMN debe_cambiar_password TINYINT(1) NOT NULL DEFAULT 0 AFTER int_fallidos');
                console.log('Columna debe_cambiar_password agregada a usuario');
            }
            conexion.release();
        } catch (error) {
            console.error('Error al inicializar datos:', error);
        }
    }

    // Metodo para iniciar el servidor
    async iniciar() {
        try {
            // Inicializar datos del sistema
            await this.inicializarDatos();

            this.app.listen(this.puerto, () => {
                console.log(`Servidor corriendo en http://localhost:${this.puerto}`);
            });
        } catch (error) {
            console.error('Error al iniciar el servidor:', error);
        }
    }
}

// Iniciar el servidor
const servidor = new Servidor();
servidor.iniciar();
