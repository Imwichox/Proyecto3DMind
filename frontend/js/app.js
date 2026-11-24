// Clase principal de la aplicacion - Maneja la comunicacion con el backend
class Aplicacion {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    // Metodo para realizar peticiones fetch
    async peticion(endpoint, metodo = 'GET', datos = null) {
        try {
            const opciones = {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Enviar id de usuario de la sesion para verificacion de rol en el backend
            const usuarioActual = sesion.obtener();
            if (usuarioActual && usuarioActual.id_usuario) {
                opciones.headers['x-id-usuario'] = usuarioActual.id_usuario;
            }

            if (datos) {
                opciones.body = JSON.stringify(datos);
            }

            const respuesta = await fetch(`${this.baseUrl}${endpoint}`, opciones);

            // Si el backend invalida la sesion (401) y habia sesion activa, cerrar y volver al login
            if (respuesta.status === 401 && sesion.estaActiva()) {
                sesion.cerrar();
                sessionStorage.removeItem('id_sesion');
                sessionStorage.setItem('aviso_sesion', 'La sesión se ha cerrado, por favor, vuelva a iniciar sesión');
                window.location.replace('login.html');
                throw new Error('Sesion cerrada');
            }

            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                const error = new Error(resultado.mensaje || 'Error en la peticion');
                error.mensaje = resultado.mensaje || 'Error en la peticion';
                throw error;
            }
            return resultado;
        } catch (error) {
            console.error('Error en peticion:', error);
            throw error;
        }
    }

    // Metodo para obtener IP del cliente
    async obtenerIP() {
        try {
            const respuesta = await fetch('https://api.ipify.org?format=json');
            const datos = await respuesta.json();
            return datos.ip;
        } catch (error) {
            return '127.0.0.1';
        }
    }
}

// Clase para gestionar usuarios
class UsuarioFrontend {
    constructor(app) {
        this.app = app;
    }

    // Metodo para registrar usuario
    async registrar(datos) {
        return await this.app.peticion('/usuarios/registrar', 'POST', datos);
    }

    // Metodo para obtener todos los usuarios
    async obtenerTodos() {
        return await this.app.peticion('/usuarios/obtener');
    }

    // Metodo para obtener el perfil del usuario con la sesion iniciada
    async obtenerPerfil() {
        return await this.app.peticion('/usuarios/perfil');
    }

    // Metodo para actualizar usuario
    async actualizar(id, datos) {
        return await this.app.peticion(`/usuarios/actualizar/${id}`, 'PUT', datos);
    }

    // Metodo para bloquear usuario
    async bloquear(id) {
        return await this.app.peticion(`/usuarios/bloquear/${id}`, 'PUT');
    }

    // Metodo para desbloquear usuario
    async desbloquear(id) {
        return await this.app.peticion(`/usuarios/desbloquear/${id}`, 'PUT');
    }

    // Metodo para eliminar usuario
    async eliminar(id, idUsuarioSesion) {
        return await this.app.peticion(`/usuarios/eliminar/${id}`, 'DELETE', { id_usuario_sesion: idUsuarioSesion });
    }

    // Metodo para cambiar contraseña
    async cambiarPassword(idUsuario, nuevaPassword, confirmarPassword) {
        return await this.app.peticion('/auth/cambiar-password', 'PUT', {
            id_usuario: idUsuario,
            nuevaPassword,
            confirmarPassword
        });
    }

    // Metodo para iniciar sesion
    async iniciarSesion(username, password) {
        const ip = await this.app.obtenerIP();
        return await this.app.peticion('/usuarios/login', 'POST', { username, password, ip });
    }

    // Metodo para verificar la contrasena del administrador
    async verificarAdminPassword(idUsuario, password) {
        return await this.app.peticion('/auth/verificar-admin', 'POST', {
            id_usuario: idUsuario,
            password
        });
    }

    // Metodo para cerrar sesion en el backend
    async logout(sessionToken) {
        return await this.app.peticion('/auth/logout', 'POST', { sessionToken });
    }

    // Metodo para consultar si el sistema necesita configuracion inicial
    async obtenerSetupStatus() {
        return await this.app.peticion('/auth/setup-status');
    }

    // Metodo para registrar el primer administrador del sistema
    async setupAdmin(datos) {
        const ip = await this.app.obtenerIP();
        return await this.app.peticion('/auth/setup-admin', 'POST', Object.assign({ ip }, datos));
    }
}

// Clase para gestionar roles
class RolFrontend {
    constructor(app) {
        this.app = app;
    }

    // Metodo para obtener todos los roles
    async obtenerTodos() {
        return await this.app.peticion('/roles/obtener');
    }
}

// Clase para gestionar tipos de documento
class TipoDocumentoFrontend {
    constructor(app) {
        this.app = app;
    }

    // Metodo para obtener todos los tipos de documento
    async obtenerTodos() {
        return await this.app.peticion('/tipos-documento/obtener');
    }
}

// Clase para gestionar historial de accesos
class HistorialFrontend {
    constructor(app) {
        this.app = app;
    }

    // Metodo para registrar salida
    async registrarSalida(idSesion) {
        return await this.app.peticion('/historial/salida', 'POST', { id_sesion: idSesion });
    }

    // Metodo para obtener todo el historial
    async obtenerTodos() {
        return await this.app.peticion('/historial/obtener');
    }
}

// Clase para gestionar sesion
class Sesion {
    constructor() {
        this.clave = 'usuario_sesion';
        // La sesion ahora vive en sessionStorage (muere al cerrar la pestaña);
        // limpiar cualquier rastro legado en localStorage
        localStorage.removeItem(this.clave);
    }

    // Metodo para guardar sesion (sessionStorage: se destruye al cerrar la pestaña)
    guardar(datos) {
        sessionStorage.setItem(this.clave, JSON.stringify(datos));
    }

    // Metodo para obtener sesion
    obtener() {
        const datos = sessionStorage.getItem(this.clave);
        return datos ? JSON.parse(datos) : null;
    }

    // Metodo para cerrar sesion
    cerrar() {
        sessionStorage.removeItem(this.clave);
    }

    // Metodo para verificar si hay sesion activa
    estaActiva() {
        return this.obtener() !== null;
    }
}

// Instancias globales
const app = new Aplicacion();
const usuarioFrontend = new UsuarioFrontend(app);
const rolFrontend = new RolFrontend(app);
const tipoDocFrontend = new TipoDocumentoFrontend(app);
const historialFrontend = new HistorialFrontend(app);
const sesion = new Sesion();
