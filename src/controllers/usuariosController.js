const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/usuarios
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, nombre, email, rol, modulos, activo,
              DATE_FORMAT(creado_en, '%d/%m/%Y') AS creado
       FROM usuarios ORDER BY creado_en DESC`
    );
    // Parsear modulos JSON si viene como string
    const usuarios = rows.map(u => ({
      ...u,
      modulos: typeof u.modulos === 'string' ? JSON.parse(u.modulos || '[]') : (u.modulos || []),
      activo:  u.activo === 1 || u.activo === true,
    }));
    res.json(usuarios);
  } catch (error) {
    console.error('Error getAll usuarios:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/usuarios/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, nombre, email, rol, modulos, activo FROM usuarios WHERE id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const u = rows[0];
    res.json({
      ...u,
      modulos: typeof u.modulos === 'string' ? JSON.parse(u.modulos || '[]') : (u.modulos || []),
      activo:  u.activo === 1 || u.activo === true,
    });
  } catch (error) {
    console.error('Error getById:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/usuarios — crear usuario
exports.create = async (req, res) => {
  try {
    const { username, nombre, password, rol, email, modulos } = req.body;

    if (!username || !nombre || !password)
      return res.status(400).json({ error: 'username, nombre y password son obligatorios' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const [existe] = await pool.query(
      'SELECT id FROM usuarios WHERE username = ?', [username.trim().toLowerCase()]
    );
    if (existe.length)
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });

    const hashed = await bcrypt.hash(password, 10);
    const modulosJSON = JSON.stringify(Array.isArray(modulos) ? modulos : []);

    const [result] = await pool.query(
      `INSERT INTO usuarios (username, nombre, password, rol, email, modulos, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username.trim().toLowerCase(), nombre.trim(), hashed,
       rol || 'secretaria', email || null, modulosJSON]
    );

    res.status(201).json({ id: result.insertId, msg: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error create usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/usuarios/:id — editar usuario (nombre, email, modulos, activo, password)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, modulos, activo, _newPassword } = req.body;

    const updates = [];
    const values  = [];

    if (nombre      !== undefined) { updates.push('nombre = ?');  values.push(nombre); }
    if (email       !== undefined) { updates.push('email = ?');   values.push(email || null); }
    if (rol         !== undefined) { updates.push('rol = ?');     values.push(rol); }
    if (modulos     !== undefined) { updates.push('modulos = ?'); values.push(JSON.stringify(Array.isArray(modulos) ? modulos : [])); }
    if (activo      !== undefined) { updates.push('activo = ?');  values.push(activo ? 1 : 0); }

    // Cambio de contraseña (admin cambia contraseña de otro usuario)
    if (_newPassword && _newPassword.length >= 6) {
      const hashed = await bcrypt.hash(_newPassword, 10);
      updates.push('password = ?');
      values.push(hashed);
    }

    if (!updates.length)
      return res.status(400).json({ error: 'No hay campos para actualizar' });

    values.push(id);
    await pool.query(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ msg: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error update usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/usuarios/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user?.id)
      return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta' });
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error remove usuario:', error);
    res.status(500).json({ error: error.message });
  }
};