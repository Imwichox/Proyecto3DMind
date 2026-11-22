// Servidor principal - Clase para iniciar el servidor Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const Usuario = require('./modelos/Usuario');
const Rol = require('./modelos/Rol');
const bcrypt = require('bcryptjs');

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
        this.app.use(express.static(path.join(__dirname, '../frontend')));
    }

    // Metodo para configurar rutas
    configurarRutas() {
        // Rutas de API
        this.app.use('/api/usuarios', require('./rutas/usuarioRutas'));
        this.app.use('/api/historial', require('./rutas/historialRutas'));
        this.app.use('/api/roles', require('./rutas/rolRutas'));
        this.app.use('/api/tipos-documento', require('./rutas/tipoDocumentoRutas'));

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

    // Metodo para inicializar datos del sistema
    async inicializarDatos() {
        try {
            const modeloRol = new Rol();
            const modeloUsuario = new Usuario();
            const bd = require('./configuracion/basedatos');

            // Verificar si hay roles, si no, insertar los basicos
            const hayRoles = await modeloRol.hayRoles();
            if (!hayRoles) {
                console.log('Insertando roles basicos...');
                await modeloRol.insertarBasicos();
            }

            // Verificar si hay usuarios con consulta simple
            const conexion = await bd.obtenerConexion();
            const [usuarios] = await conexion.query('SELECT COUNT(*) as total FROM usuario');
            conexion.release();

            if (usuarios[0].total === 0) {
                console.log('Creando usuario administrador inicial...');
                const passwordEncriptada = await bcrypt.hash('admin123', 10);
                
                // Obtener el rol de Administrador (id_rol = 1)
                const passwordAdmin = new Usuario({
                    nombre: 'Administrador Principal',
                    cedula: '123456789',
                    email: 'admin@3dmind.com',
                    username: 'admin',
                    password: passwordEncriptada,
                    id_rol_FK: 1,
                    id_tipo_doc_FK: 1 // CC
                });
                
                await passwordAdmin.crear();
                console.log('Usuario admin creado: usuario=admin, contraseña=admin123');
            }
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
