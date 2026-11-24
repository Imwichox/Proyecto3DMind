// Modelo de Usuario - Clase para gestionar datos de usuarios
const bd = require('../configuracion/basedatos');
const bcrypt = require('bcryptjs');

class Usuario {
    constructor(datos = {}) {
        this.id_usuario = datos.id_usuario || null;
        this.cedula = datos.cedula || '';
        this.nombre = datos.nombre || '';
        this.email = datos.email || '';
        this.username = datos.username || '';
        this.password = datos.password || '';
        this.estado = datos.estado || 'Activo';
        this.int_fallidos = datos.int_fallidos || 0;
        this.debe_cambiar_password = datos.debe_cambiar_password ? 1 : 0;
        this.id_rol_FK = datos.id_rol_FK || null;
        this.id_tipo_doc_FK = datos.id_tipo_doc_FK || null;
    }

    // Metodo para crear un nuevo usuario
    async crear() {
        try {
            const conexion = await bd.obtenerConexion();
            const passwordEncriptada = await bcrypt.hash(this.password, 10);
            
            const [resultado] = await conexion.query(
                'INSERT INTO usuario (cedula, nombre, email, username, password, estado, int_fallidos, debe_cambiar_password, id_rol_FK, id_tipo_doc_FK) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [this.cedula, this.nombre, this.email, this.username, passwordEncriptada, this.estado, this.int_fallidos, this.debe_cambiar_password, this.id_rol_FK, this.id_tipo_doc_FK]
            );
            
            conexion.release();
            return resultado.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para buscar por username
    async buscarPorUsername(username) {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT u.*, r.nombre_rol FROM usuario u LEFT JOIN rol r ON u.id_rol_FK = r.id_rol WHERE u.username = ?',
                [username]
            );
            conexion.release();
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para verificar duplicados
    async verificarDuplicados(cedula, email, username) {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT cedula, email, username, estado FROM usuario WHERE cedula = ? OR email = ? OR username = ?',
                [cedula, email, username]
            );
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para verificar duplicados excluyendo un usuario (para edicion)
    async verificarDuplicadosExcluyendo(id, cedula, email, username) {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT cedula, email, username, estado FROM usuario WHERE (cedula = ? OR email = ? OR username = ?) AND id_usuario != ?',
                [cedula, email, username, id]
            );
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para obtener todos los usuarios activos
    async obtenerTodos() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT u.*, r.nombre_rol, t.nom_tipo_doc FROM usuario u LEFT JOIN rol r ON u.id_rol_FK = r.id_rol LEFT JOIN tipo_documento t ON u.id_tipo_doc_FK = t.id_tipo_doc WHERE u.estado != "Eliminado" ORDER BY u.id_usuario'
            );
            conexion.release();
            return filas;
        } catch (error) {
            // Si falla el JOIN, intentar sin JOIN
            try {
                const conexion = await bd.obtenerConexion();
                const [filas] = await conexion.query(
                    'SELECT * FROM usuario WHERE estado != "Eliminado" ORDER BY id_usuario'
                );
                conexion.release();
                return filas;
            } catch (error2) {
                throw error2;
            }
        }
    }

    // Metodo para buscar usuarios por texto
    async buscarPorTexto(texto) {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT u.*, r.nombre_rol, t.nom_tipo_doc FROM usuario u LEFT JOIN rol r ON u.id_rol_FK = r.id_rol LEFT JOIN tipo_documento t ON u.id_tipo_doc_FK = t.id_tipo_doc WHERE u.estado != "Eliminado" AND (u.nombre LIKE ? OR u.cedula LIKE ? OR u.username LIKE ?) ORDER BY u.id_usuario',
                [`%${texto}%`, `%${texto}%`, `%${texto}%`]
            );
            conexion.release();
            return filas;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para obtener un usuario por ID
    async obtenerPorId(id) {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT * FROM usuario WHERE id_usuario = ?',
                [id]
            );
            conexion.release();
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para actualizar usuario
    async actualizar(id, datos) {
        try {
            const conexion = await bd.obtenerConexion();
            let query = 'UPDATE usuario SET nombre = ?, cedula = ?, email = ?, username = ?, id_rol_FK = ?, id_tipo_doc_FK = ?';
            const valores = [datos.nombre, datos.cedula, datos.email, datos.username, datos.id_rol_FK, datos.id_tipo_doc_FK];
            
            if (datos.password && datos.password !== '') {
                const passwordEncriptada = await bcrypt.hash(datos.password, 10);
                query += ', password = ?';
                valores.push(passwordEncriptada);
            }
            
            query += ' WHERE id_usuario = ?';
            valores.push(id);
            
            const [resultado] = await conexion.query(query, valores);
            conexion.release();
            return resultado.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para incrementar intentos fallidos
    async incrementarIntentosFallidos(id) {
        try {
            const conexion = await bd.obtenerConexion();
            await conexion.query(
                'UPDATE usuario SET int_fallidos = int_fallidos + 1 WHERE id_usuario = ?',
                [id]
            );
            conexion.release();
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para bloquear usuario (solo si esta Activo)
    async bloquear(id) {
        try {
            const conexion = await bd.obtenerConexion();
            const [resultado] = await conexion.query(
                'UPDATE usuario SET estado = "Bloqueado" WHERE id_usuario = ? AND estado = "Activo"',
                [id]
            );
            conexion.release();
            return resultado.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para desbloquear usuario (solo si esta Bloqueado; resetea intentos)
    async desbloquear(id) {
        try {
            const conexion = await bd.obtenerConexion();
            const [resultado] = await conexion.query(
                'UPDATE usuario SET estado = "Activo", int_fallidos = 0 WHERE id_usuario = ? AND estado = "Bloqueado"',
                [id]
            );
            conexion.release();
            return resultado.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para eliminar logicamente
    async eliminar(id) {
        try {
            const conexion = await bd.obtenerConexion();
            const [resultado] = await conexion.query(
                'UPDATE usuario SET estado = "Eliminado" WHERE id_usuario = ?',
                [id]
            );
            conexion.release();
            return resultado.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para cambiar la contraseña y desactivar la bandera de primer ingreso
    async cambiarPassword(id, passwordEncriptada) {
        try {
            const conexion = await bd.obtenerConexion();
            const [resultado] = await conexion.query(
                'UPDATE usuario SET password = ?, debe_cambiar_password = 0 WHERE id_usuario = ?',
                [passwordEncriptada, id]
            );
            conexion.release();
            return resultado.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para contar usuarios que no estan eliminados (estado del setup inicial)
    async contarNoEliminados() {
        try {
            const conexion = await bd.obtenerConexion();
            const [filas] = await conexion.query(
                'SELECT COUNT(*) as total FROM usuario WHERE estado != "Eliminado"'
            );
            conexion.release();
            return filas[0].total;
        } catch (error) {
            throw error;
        }
    }

    // Metodo para reiniciar intentos fallidos
    async reiniciarIntentos(id) {
        try {
            const conexion = await bd.obtenerConexion();
            await conexion.query(
                'UPDATE usuario SET int_fallidos = 0 WHERE id_usuario = ?',
                [id]
            );
            conexion.release();
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Usuario;
