// Controlador de Usuario - Clase para manejar la logica de usuarios
const Usuario = require('../modelos/Usuario');
const HistorialAcceso = require('../modelos/HistorialAcceso');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Sesiones activas en memoria: sessionToken -> { id_usuario, fecha }
const sesionesActivas = new Map();

class UsuarioControlador {
    constructor() {
        // Express invoca los handlers sin contexto: enlazar los que usan this
        this.iniciarSesion = this.iniciarSesion.bind(this);
        this.setupAdmin = this.setupAdmin.bind(this);
    }

    // Metodo para registrar un nuevo usuario
    async registrar(req, res) {
        try {
            const { nombre, id_tipo_doc_FK, cedula, email, username, id_rol_FK, password } = req.body;
            
            // Validaciones basicas
            if (!nombre || nombre.length < 3) {
                return res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres' });
            }
            if (!cedula || !/^\d+$/.test(cedula)) {
                return res.status(400).json({ mensaje: 'La cedula debe contener solo numeros' });
            }
            if (!email || !UsuarioControlador.prototype.validarEmail(email)) {
                return res.status(400).json({ mensaje: 'El correo no es valido' });
            }
            if (!username) {
                return res.status(400).json({ mensaje: 'El usuario es requerido' });
            }
            if (!password || password.length < 6) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
            }
            if (!id_tipo_doc_FK || id_tipo_doc_FK === '') {
                return res.status(400).json({ mensaje: 'Debe seleccionar un tipo de documento' });
            }
            if (!id_rol_FK || id_rol_FK === '') {
                return res.status(400).json({ mensaje: 'Debe seleccionar un rol' });
            }
            
            // Verificar duplicados
            const modeloUsuario = new Usuario();
            const duplicados = await modeloUsuario.verificarDuplicados(cedula, email, username);
            
            for (const dup of duplicados) {
                if (dup.cedula === cedula && dup.estado !== 'Eliminado') {
                    return res.status(400).json({ mensaje: 'Esta cedula ya esta registrada' });
                }
                if (dup.email === email) {
                    return res.status(400).json({ mensaje: 'Este correo ya esta en uso' });
                }
                if (dup.username === username) {
                    return res.status(400).json({ mensaje: 'Este nombre de usuario ya esta en uso' });
                }
            }
            
            // Crear usuario (los operarios deben cambiar su clave en el primer ingreso)
            const nuevoUsuario = new Usuario({
                nombre,
                id_tipo_doc_FK: parseInt(id_tipo_doc_FK),
                cedula,
                email,
                username,
                password,
                id_rol_FK: parseInt(id_rol_FK),
                debe_cambiar_password: parseInt(id_rol_FK) === 2 ? 1 : 0
            });
            
            await nuevoUsuario.crear();
            res.json({ mensaje: 'Usuario registrado con exito' });
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ mensaje: 'Error al registrar usuario: ' + error.message });
        }
    }

    // Metodo para validar formato de email
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Metodo para obtener todos los usuarios
    async obtenerTodos(req, res) {
        try {
            const modeloUsuario = new Usuario();
            const usuarios = await modeloUsuario.obtenerTodos();
            res.json(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    }

    // Metodo para obtener el perfil del usuario autenticado (sin password)
    async obtenerPerfil(req, res) {
        try {
            const idUsuario = req.headers['x-id-usuario'];
            if (!idUsuario) {
                return res.status(403).json({ mensaje: 'Acceso denegado: se requiere una sesion activa' });
            }

            const modeloUsuario = new Usuario();
            const usuario = await modeloUsuario.obtenerPorId(idUsuario);
            if (!usuario || usuario.estado === 'Eliminado') {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            const perfil = { ...usuario };
            delete perfil.password;
            res.json(perfil);
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({ mensaje: 'Error al obtener perfil' });
        }
    }

    // Metodo para buscar usuarios
    async buscar(req, res) {
        try {
            const { texto } = req.query;
            if (!texto) {
                return res.status(400).json({ mensaje: 'Debe proporcionar un texto de busqueda' });
            }
            
            const modeloUsuario = new Usuario();
            const usuarios = await modeloUsuario.buscarPorTexto(texto);
            
            if (usuarios.length === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            
            res.json(usuarios);
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            res.status(500).json({ mensaje: 'Error al buscar usuarios' });
        }
    }

    // Metodo para actualizar un usuario
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, id_tipo_doc_FK, cedula, email, username, id_rol_FK, password } = req.body;
            
            // Validaciones basicas
            if (!nombre || nombre.length < 3) {
                return res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres' });
            }
            if (!cedula || !/^\d+$/.test(cedula)) {
                return res.status(400).json({ mensaje: 'La cedula debe contener solo numeros' });
            }
            if (!email || !UsuarioControlador.prototype.validarEmail(email)) {
                return res.status(400).json({ mensaje: 'El correo no es valido' });
            }
            if (!username) {
                return res.status(400).json({ mensaje: 'El usuario es requerido' });
            }
            if (!id_tipo_doc_FK || id_tipo_doc_FK === '') {
                return res.status(400).json({ mensaje: 'Debe seleccionar un tipo de documento' });
            }
            if (!id_rol_FK || id_rol_FK === '') {
                return res.status(400).json({ mensaje: 'Debe seleccionar un rol' });
            }
            
            // Verificar duplicados excluyendo el usuario actual
            const modeloUsuario = new Usuario();
            const duplicados = await modeloUsuario.verificarDuplicadosExcluyendo(id, cedula, email, username);
            
            for (const dup of duplicados) {
                if (dup.cedula === cedula && dup.estado !== 'Eliminado') {
                    return res.status(400).json({ mensaje: 'Esta cedula ya esta registrada' });
                }
                if (dup.email === email) {
                    return res.status(400).json({ mensaje: 'Este correo ya esta en uso' });
                }
                if (dup.username === username) {
                    return res.status(400).json({ mensaje: 'Este nombre de usuario ya esta en uso' });
                }
            }
            
            // Autoedicion: el administrador puede cambiar cualquier campo;
            // un usuario normal (Operario) solo puede cambiar su propia contrasena
            let datosUpdate = {
                nombre,
                id_tipo_doc_FK: parseInt(id_tipo_doc_FK),
                cedula,
                email,
                username,
                id_rol_FK: parseInt(id_rol_FK),
                password
            };

            const idSolicitante = req.headers['x-id-usuario'];
            if (idSolicitante && String(id) === String(idSolicitante)) {
                const solicitante = await modeloUsuario.obtenerPorId(idSolicitante);
                if (solicitante && solicitante.id_rol_FK !== 1) {
                    // Ignorar cualquier campo que no sea la contrasena
                    if (password && password !== '') {
                        const coincide = await bcrypt.compare(password, solicitante.password);
                        if (coincide) {
                            return res.status(400).json({ mensaje: 'La nueva contraseña no puede ser igual a la contraseña actual.' });
                        }
                    }
                    datosUpdate = {
                        nombre: solicitante.nombre,
                        id_tipo_doc_FK: solicitante.id_tipo_doc_FK,
                        cedula: solicitante.cedula,
                        email: solicitante.email,
                        username: solicitante.username,
                        id_rol_FK: solicitante.id_rol_FK,
                        password
                    };
                }
            }

            // Actualizar usuario
            const actualizado = await modeloUsuario.actualizar(id, datosUpdate);
            
            if (!actualizado) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado o sin cambios' });
            }
            
            res.json({ mensaje: 'Usuario actualizado con exito' });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ mensaje: 'Error al actualizar usuario: ' + error.message });
        }
    }

    // Metodo para bloquear un usuario
    async bloquear(req, res) {
        try {
            const { id } = req.params;
            const modeloUsuario = new Usuario();
            const afectadas = await modeloUsuario.bloquear(id);
            if (afectadas === 0) {
                return res.status(400).json({ mensaje: 'El usuario no esta en estado Activo' });
            }
            res.json({ mensaje: 'Usuario bloqueado con exito' });
        } catch (error) {
            console.error('Error al bloquear usuario:', error);
            res.status(500).json({ mensaje: 'Error al bloquear usuario' });
        }
    }

    // Metodo para desbloquear un usuario
    async desbloquear(req, res) {
        try {
            const { id } = req.params;
            const modeloUsuario = new Usuario();
            const afectadas = await modeloUsuario.desbloquear(id);
            if (afectadas === 0) {
                return res.status(400).json({ mensaje: 'El usuario no esta en estado Bloqueado' });
            }
            res.json({ mensaje: 'Usuario desbloqueado con exito' });
        } catch (error) {
            console.error('Error al desbloquear usuario:', error);
            res.status(500).json({ mensaje: 'Error al desbloquear usuario' });
        }
    }

    // Metodo para eliminar un usuario
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const { id_usuario_sesion } = req.body;
            
            // Impedir auto-eliminacion
            if (parseInt(id) === parseInt(id_usuario_sesion)) {
                return res.status(400).json({ mensaje: 'No puede eliminar su propio usuario en sesion' });
            }
            
            const modeloUsuario = new Usuario();
            const eliminado = await modeloUsuario.eliminar(id);
            if (!eliminado) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado o ya eliminado' });
            }
            res.json({ mensaje: 'Usuario eliminado con exito' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ mensaje: 'Error al eliminar usuario' });
        }
    }

    // Metodo para cambiar la contraseña (obligatorio tras login con clave por defecto)
    async cambiarPassword(req, res) {
        try {
            const { id_usuario, nuevaPassword, confirmarPassword } = req.body;
            
            if (!id_usuario) {
                return res.status(400).json({ mensaje: 'El id de usuario es requerido' });
            }
            if (!nuevaPassword || nuevaPassword.length < 6) {
                return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres' });
            }
            if (nuevaPassword !== confirmarPassword) {
                return res.status(400).json({ mensaje: 'Las contraseñas no coinciden' });
            }

            // Impedir reutilizar la contraseña actual
            const modeloUsuario = new Usuario();
            const usuarioActual = await modeloUsuario.obtenerPorId(id_usuario);
            if (!usuarioActual) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            const esLaMisma = await bcrypt.compare(nuevaPassword, usuarioActual.password);
            if (esLaMisma) {
                return res.status(400).json({ mensaje: 'La nueva contraseña no puede ser igual a la contraseña actual.' });
            }

            const passwordEncriptada = await bcrypt.hash(nuevaPassword, 10);
            const actualizado = await modeloUsuario.cambiarPassword(id_usuario, passwordEncriptada);
            
            if (!actualizado) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            
            res.json({ mensaje: 'Contraseña actualizada con exito' });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
        }
    }

    // Metodo para verificar la contrasena del administrador (doble verificacion)
    async verificarAdminPassword(req, res) {
        try {
            const { id_usuario, password } = req.body;

            if (!id_usuario || !password) {
                return res.status(400).json({ mensaje: 'Datos incompletos' });
            }

            const modeloUsuario = new Usuario();
            const usuario = await modeloUsuario.obtenerPorId(id_usuario);

            // 403 (no 401): el frontend cierra la sesion ante cualquier 401;
            // una clave incorrecta en la verificacion de seguridad no debe tumbar la sesion.
            // Se acepta cualquier usuario activo: la reautenticacion por inactividad aplica a todos los roles
            if (!usuario || usuario.estado !== 'Activo') {
                return res.status(403).json({ mensaje: 'Contraseña incorrecta' });
            }

            const coincide = await bcrypt.compare(password, usuario.password);
            if (!coincide) {
                return res.status(403).json({ mensaje: 'Contraseña incorrecta' });
            }

            res.json({ autorizado: true });
        } catch (error) {
            console.error('Error al verificar administrador:', error);
            res.status(500).json({ mensaje: 'Error al verificar administrador' });
        }
    }

    // Metodo para cerrar sesion y limpiar el token en memoria
    async logout(req, res) {
        try {
            const { sessionToken } = req.body;
            if (sessionToken) {
                sesionesActivas.delete(sessionToken);
            }
            res.json({ mensaje: 'Sesion cerrada' });
        } catch (error) {
            console.error('Error al cerrar sesion:', error);
            res.status(500).json({ mensaje: 'Error al cerrar sesion' });
        }
    }

    // Metodo para iniciar sesion
    async iniciarSesion(req, res) {
        try {
            const { username, password, ip } = req.body;
            
            // Validaciones basicas
            if (!username || !password) {
                return res.status(400).json({ mensaje: 'Complete todos los campos' });
            }
            
            const modeloUsuario = new Usuario();
            const usuario = await modeloUsuario.buscarPorUsername(username);
            
            if (!usuario) {
                return res.status(404).json({ mensaje: 'El usuario no existe' });
            }
            
            // Verificar si el usuario esta eliminado
            if (usuario.estado === 'Eliminado') {
                return res.status(403).json({ mensaje: 'Este usuario se encuentra inactivo/eliminado' });
            }
            
            // Verificar si el usuario esta bloqueado
            if (usuario.estado === 'Bloqueado') {
                if (usuario.int_fallidos < 5) {
                    return res.status(403).json({ mensaje: 'Usuario inactivo, por favor contacte con su administrador.' });
                }
                return res.status(403).json({ mensaje: 'Usuario bloqueado por intentos fallidos. Contacte al administrador.' });
            }
            
            // Verificar contraseña
            const passwordValida = await bcrypt.compare(password, usuario.password);
            
            if (!passwordValida) {
                // Incrementar intentos fallidos
                await modeloUsuario.incrementarIntentosFallidos(usuario.id_usuario);
                usuario.int_fallidos++;
                
                const intentosRestantes = 5 - usuario.int_fallidos;
                
                // Si llega a 5 intentos fallidos, bloquear usuario
                if (usuario.int_fallidos >= 5) {
                    await modeloUsuario.bloquear(usuario.id_usuario);
                    return res.status(403).json({ mensaje: 'Usuario bloqueado por superar 5 intentos fallidos. Contacte al Administrador' });
                }
                
                return res.status(401).json({ 
                    mensaje: `Usuario o contraseña incorrectos. Le quedan ${intentosRestantes} intentos`,
                    intentosRestantes
                });
            }
            
            // Reiniciar intentos fallidos
            await modeloUsuario.reiniciarIntentos(usuario.id_usuario);

            // Si el usuario debe cambiar su clave en el primer ingreso, exigirlo antes de entrar
            const requiereCambio = usuario.debe_cambiar_password === 1 || usuario.debe_cambiar_password === true;

            this.responderSesionExitosa(req, res, usuario, requiereCambio);
        } catch (error) {
            console.error('Error al iniciar sesion:', error);
            res.status(500).json({ mensaje: 'Error al iniciar sesion' });
        }
    }

    // Normalizar IP del cliente (loopback se ve limpio en local)
    normalizarIp(ip, fallback) {
        let ipCliente = ip || fallback || '127.0.0.1';
        if (ipCliente === '::1') {
            ipCliente = '127.0.0.1';
        }
        return ipCliente.replace('::ffff:', '');
    }

    // Generar token de sesion, registrar el acceso en historial y responder con la sesion activa
    async responderSesionExitosa(req, res, usuario, requiereCambio = false) {
        const ipCliente = this.normalizarIp(req.body.ip, req.ip);

        // Registrar acceso en historial (sin romper el flujo si falla)
        let idSesionHistorial = null;
        try {
            const modeloHistorial = new HistorialAcceso();
            idSesionHistorial = await modeloHistorial.crear(usuario.id_usuario, ipCliente);
        } catch (errorHistorial) {
            console.error('No se pudo registrar el acceso en historial:', errorHistorial);
        }

        // Generar token de sesion unico en memoria
        const sessionToken = crypto.randomBytes(32).toString('hex');
        sesionesActivas.set(sessionToken, { id_usuario: usuario.id_usuario, fecha: new Date() });

        res.json({
            mensaje: 'Inicio de sesion exitoso',
            requiereCambioPassword: requiereCambio,
            sessionToken,
            ip: ipCliente,
            fecha_ingreso: new Date(),
            id_sesion: idSesionHistorial,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                username: usuario.username,
                id_rol: usuario.id_rol_FK,
                nombre_rol: usuario.nombre_rol
            }
        });
    }

    // Metodo para consultar si el sistema necesita la configuracion inicial
    async setupStatus(req, res) {
        try {
            const modeloUsuario = new Usuario();
            const total = await modeloUsuario.contarNoEliminados();
            res.json({ needsSetup: total === 0 });
        } catch (error) {
            console.error('Error al consultar estado de configuracion:', error);
            res.status(500).json({ mensaje: 'Error al consultar estado de configuracion' });
        }
    }

    // Metodo para registrar el primer administrador del sistema (solo si no hay usuarios)
    async setupAdmin(req, res) {
        try {
            const modeloUsuario = new Usuario();

            // Solo permitir si no existe ningun usuario no eliminado
            const total = await modeloUsuario.contarNoEliminados();
            if (total > 0) {
                return res.status(403).json({ mensaje: 'El sistema ya fue configurado' });
            }

            const { nombre, cedula, email, username, password, id_tipo_doc_FK } = req.body;

            if (!nombre || nombre.length < 3) {
                return res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres' });
            }
            if (!cedula || !/^\d+$/.test(cedula)) {
                return res.status(400).json({ mensaje: 'La cedula debe contener solo numeros' });
            }
            if (!email || !UsuarioControlador.prototype.validarEmail(email)) {
                return res.status(400).json({ mensaje: 'El correo no es valido' });
            }
            if (!username) {
                return res.status(400).json({ mensaje: 'El usuario es requerido' });
            }
            if (!password || password.length < 6) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
            }

            const duplicados = await modeloUsuario.verificarDuplicados(cedula, email, username);
            for (const dup of duplicados) {
                if (dup.cedula === cedula && dup.estado !== 'Eliminado') {
                    return res.status(400).json({ mensaje: 'Esta cedula ya esta registrada' });
                }
                if (dup.email === email) {
                    return res.status(400).json({ mensaje: 'Este correo ya esta en uso' });
                }
                if (dup.username === username) {
                    return res.status(400).json({ mensaje: 'Este nombre de usuario ya esta en uso' });
                }
            }

            const admin = new Usuario({
                nombre,
                cedula,
                email,
                username,
                password,
                id_rol_FK: 1,
                id_tipo_doc_FK: id_tipo_doc_FK ? parseInt(id_tipo_doc_FK) : 1,
                estado: 'Activo',
                int_fallidos: 0,
                debe_cambiar_password: 0
            });
            await admin.crear();

            // Recuperar el usuario creado para responder con la sesion activa
            const creado = await modeloUsuario.buscarPorUsername(username);
            this.responderSesionExitosa(req, res, creado, false);
        } catch (error) {
            console.error('Error al configurar el administrador inicial:', error);
            res.status(500).json({ mensaje: 'Error al configurar el administrador inicial: ' + error.message });
        }
    }
}

module.exports = new UsuarioControlador();
