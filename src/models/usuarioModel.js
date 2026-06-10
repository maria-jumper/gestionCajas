const db = require('../config/db');

class Usuario {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, username, nombre, email, rol, modulos, activo, creado_en FROM usuarios WHERE id = ?',
      [id]
    );
    if (!rows[0]) return null;
    const u = rows[0];
    return {
      ...u,
      modulos: typeof u.modulos === 'string' ? JSON.parse(u.modulos || '[]') : (u.modulos || []),
      activo:  u.activo === 1 || u.activo === true,
    };
  }

  static async findAll() {
    const [rows] = await db.query(
      `SELECT id, username, nombre, email, rol, modulos, activo,
              DATE_FORMAT(creado_en, '%d/%m/%Y') AS creado
       FROM usuarios ORDER BY creado_en DESC`
    );
    return rows.map(u => ({
      ...u,
      modulos: typeof u.modulos === 'string' ? JSON.parse(u.modulos || '[]') : (u.modulos || []),
      activo:  u.activo === 1 || u.activo === true,
    }));
  }

  static async create({ username, nombre, password, rol, email, modulos }) {
    const [result] = await db.query(
      'INSERT INTO usuarios (username, nombre, password, rol, email, modulos, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [username, nombre, password, rol || 'secretaria', email || null,
       JSON.stringify(Array.isArray(modulos) ? modulos : [])]
    );
    return result.insertId;
  }

  static async update(id, campos) {
    const permitidos = ['nombre', 'email', 'rol', 'modulos', 'activo', 'password'];
    const updates = [];
    const values  = [];
    for (const k of permitidos) {
      if (campos[k] !== undefined) {
        updates.push(`${k} = ?`);
        values.push(k === 'modulos' ? JSON.stringify(campos[k]) :
                    k === 'activo'  ? (campos[k] ? 1 : 0) : campos[k]);
      }
    }
    if (!updates.length) return 0;
    values.push(id);
    const [result] = await db.query(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async deleteById(id) {
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}

module.exports = Usuario;