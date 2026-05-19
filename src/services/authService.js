const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel'); // Ajustado al nombre de modelo que creamos

exports.register = async (data) => {
    // 1. Validamos por username en lugar de email
    const existing = await Usuario.findByUsername(data.username);
    if (existing) throw new Error('El usuario ya existe');

    const hashed = await bcrypt.hash(data.password, 10);

    // 2. Ajustamos los campos y el rol por defecto según tu ENUM en BD
    const result = await Usuario.create({
        username: data.username,
        nombre: data.nombre,
        password: hashed,
        rol: data.rol || 'secretaria' 
    });

    return result;
};

exports.login = async (username, password) => {
    // 3. Buscamos por username
    const user = await Usuario.findByUsername(username);
    if (!user) throw new Error('Usuario no encontrado');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    // 4. Se genera el token (agregué un fallback de '8h' por si la variable de entorno falla)
    const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' } 
    );

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            nombre: user.nombre,
            rol: user.rol
        }
    };
};