const Usuario  = require('../models/usuarioModel');
const bcrypt   = require('bcryptjs');
const response = require('../utils/response');

// GET /api/usuarios — lista todos los usuarios (solo admin)
exports.getAll = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        return response.success(res, 'Usuarios obtenidos', { usuarios });
    } catch (error) {
        return response.error(res, 'Error al obtener usuarios', 500, error.message);
    }
};

// POST /api/usuarios — crea un nuevo usuario (solo admin)
// Body: { username, nombre, password, rol }
exports.create = async (req, res) => {
    try {
        const { username, nombre, password, rol } = req.body;

        if (!username || !nombre || !password)
            return response.error(res, 'username, nombre y password son obligatorios', 400);

        if (password.length < 6)
            return response.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);

        const existe = await Usuario.findByUsername(username.trim().toLowerCase());
        if (existe)
            return response.error(res, 'El nombre de usuario ya está en uso', 409);

        const hashed   = await bcrypt.hash(password, 10);
        const nuevoId  = await Usuario.create({
            username: username.trim().toLowerCase(),
            nombre:   nombre.trim(),
            password: hashed,
            rol:      rol || 'secretaria',
        });

        return response.success(res, 'Usuario creado exitosamente', { id: nuevoId }, 201);
    } catch (error) {
        return response.error(res, 'Error al crear usuario', 500, error.message);
    }
};

// DELETE /api/usuarios/:id — elimina un usuario (solo admin)
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user?.id)
            return response.error(res, 'No puedes eliminar tu propia cuenta', 403);

        await Usuario.deleteById(id);
        return response.success(res, 'Usuario eliminado correctamente');
    } catch (error) {
        return response.error(res, 'Error al eliminar usuario', 500, error.message);
    }
};