const Usuario = require('../models/usuarioModel');
const bcrypt  = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, nombre, password, rol, email, modulos } = req.body;
    if (!username || !nombre || !password)
      return res.status(400).json({ error: 'username, nombre y password son obligatorios' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const existe = await Usuario.findByUsername(username.trim().toLowerCase());
    if (existe) return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });

    const hashed = await bcrypt.hash(password, 10);
    const id = await Usuario.create({
      username: username.trim().toLowerCase(),
      nombre:   nombre.trim(),
      password: hashed,
      rol:      rol || 'secretaria',
      email:    email || null,
      modulos:  modulos || [],
    });
    res.status(201).json({ id, msg: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, modulos, activo, _newPassword } = req.body;

    const campos = {};
    if (nombre   !== undefined) campos.nombre  = nombre;
    if (email    !== undefined) campos.email   = email;
    if (rol      !== undefined) campos.rol     = rol;
    if (modulos  !== undefined) campos.modulos = modulos;
    if (activo   !== undefined) campos.activo  = activo;

    if (_newPassword && _newPassword.length >= 6) {
      campos.password = await bcrypt.hash(_newPassword, 10);
    }

    await Usuario.update(id, campos);
    res.json({ msg: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user?.id)
      return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta' });
    await Usuario.deleteById(id);
    res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};