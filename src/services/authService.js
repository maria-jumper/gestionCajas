// ═══════════════════════════════════════════════════════
// authService.js  →  src/services/authService.js
// ═══════════════════════════════════════════════════════
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

exports.register = async (data) => {
  const existing = await Usuario.findByUsername(data.username);
  if (existing) throw new Error('El usuario ya existe');

  const hashed = await bcrypt.hash(data.password, 10);
  return await Usuario.create({
    username: data.username,
    nombre:   data.nombre,
    password: hashed,
    rol:      data.rol || 'secretaria',
    email:    data.email || null,
    modulos:  data.modulos || [],
  });
};

exports.login = async (username, password) => {
  const user = await Usuario.findByUsername(username);
  if (!user) throw new Error('Usuario no encontrado');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  // Parsear módulos para incluirlos en el token
  const modulos = typeof user.modulos === 'string'
    ? JSON.parse(user.modulos || '[]') : (user.modulos || []);

  return {
    token,
    user: {
      id:       user.id,
      username: user.username,
      nombre:   user.nombre,
      email:    user.email,
      rol:      user.rol,
      modulos,
      activo:   user.activo === 1 || user.activo === true,
    }
  };
};