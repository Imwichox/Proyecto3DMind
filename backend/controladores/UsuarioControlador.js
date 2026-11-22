// Controlador de Usuario - Clase para manejar la logica de usuarios
const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcryptjs');

class UsuarioControlador {
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
            if (!email || !this.validarEmail(email)) {
                return res.status(400).json({ mensaje: 'El correo no es valido' });
            }
            if (!username) {
                return res.status(400).json({ mensaje: 'El usuario es requerido' });
            }
            if (!password || password.length < 6) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
            }
            
            // Verificar duplicados
            const modeloUsuario = new Usuario();
            const duplicados = await modeloUsuario.verificarDuplicados(cedula, email, username);
            
            for (const dup of duplicados) {
                if (dup.cedula === cedula) {
                    return res.status(400).json({ mensaje: 'Esta cedula ya esta registrada' });
                }
                if (dup.email === email) {
                    return res.status(400).json({ mensaje: 'Este correo ya esta en uso' });
                }
                if (dup.username === username) {
                    return res.status(400).json({ mensaje: 'Este nombre de usuario ya esta en uso' });
                }
            }
            
            // Crear usuario
            const nuevoUsuario = new Usuario({
                nombre,
                id_tipo_doc_FK,
                cedula,
                email,
                username,
                password,
                id_rol_FK
            });
            
            await nuevoUsuario.crear();
            res.json({ mensaje: 'Usuario registrado con exito' });
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ mensaje: 'Error al registrar usuario' });
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
            if (!email || !this.validarEmail(email)) {
                return res.status(400).json({ mensaje: 'El correo no es valido' });
            }
            if (!username) {
                return res.status(400).json({ mensaje: 'El usuario es requerido' });
            }
            
            // Verificar duplicados excluyendo el usuario actual
            const modeloUsuario = new Usuario();
            const duplicados = await modeloUsuario.verificarDuplicadosExcluyendo(id, cedula, email, username);
            
            for (const dup of duplicados) {
                if (dup.cedula === cedula) {
                    return res.status(400).json({ mensaje: 'Esta cedula ya esta registrada' });
                }
                if (dup.email === email) {
                    return res.status(400).json({ mensaje: 'Este correo ya esta en uso' });
                }
                if (dup.username === username) {
                    return res.status(400).json({ mensaje: 'Este nombre de usuario ya esta en uso' });
                }
            }
            
            // Actualizar usuario
            await modeloUsuario.actualizar(id, {
                nombre,
                id_tipo_doc_FK,
                cedula,
                email,
                username,
                id_rol_FK,
                password
            });
            
            res.json({ mensaje: 'Usuario actualizado con exito' });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ mensaje: 'Error al actualizar usuario' });
        }
    }

    // Metodo para desbloquear un usuario
    async desbloquear(req, res) {
        try {
            const { id } = req.params;
            const modeloUsuario = new Usuario();
            await modeloUsuario.desbloquear(id);
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
            await modeloUsuario.eliminar(id);
            res.json({ mensaje: 'Usuario eliminado con exito' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ mensaje: 'Error al eliminar usuario' });
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
                return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
            }
            
            // Verificar si el usuario esta eliminado
            if (usuario.estado === 'Eliminado') {
                return res.status(403).json({ mensaje: 'Este usuario se encuentra inactivo/eliminado' });
            }
            
            // Verificar si el usuario esta bloqueado
            if (usuario.estado === 'Bloqueado') {
                return res.status(403).json({ mensaje: 'Usuario bloqueado por superar 5 intentos fallidos. Contacte al Administrador' });
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
            
            // Retornar datos del usuario (sin contraseña)
            res.json({
                mensaje: 'Inicio de sesion exitoso',
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    username: usuario.username,
                    id_rol: usuario.id_rol,
                    nombre_rol: usuario.nombre_rol
                }
            });
        } catch (error) {
            console.error('Error al iniciar sesion:', error);
            res.status(500).json({ mensaje: 'Error al iniciar sesion' });
        }
    }
}

module.exports = new UsuarioControlador();
