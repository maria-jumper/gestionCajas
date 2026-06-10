const db = require('../config/db');

class Gasto {
  static async findAll({ fecha, categoria } = {}) {
    let sql = `SELECT g.*, u.nombre AS usuario_nombre
               FROM gastos g LEFT JOIN usuarios u ON g.usuario_id = u.id WHERE 1=1`;
    const params = [];
    if (fecha)     { sql += ' AND g.fecha = ?';      params.push(fecha); }
    if (categoria && categoria !== 'Todos') {
                     sql += ' AND g.categoria = ?';  params.push(categoria); }
    sql += ' ORDER BY g.creado_en DESC';
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async create({ descripcion, categoria, valor, observaciones, fecha, hora, registrado_por, usuario_id }) {
    const [result] = await db.query(
      `INSERT INTO gastos (descripcion, categoria, valor, observaciones, fecha, hora, registrado_por, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [descripcion, categoria||'otro', parseFloat(valor),
       observaciones||null, fecha, hora||null, registrado_por||null, usuario_id||null]
    );
    return result.insertId;
  }

  static async delete(id) {
    await db.query('DELETE FROM gastos WHERE id = ?', [id]);
  }
}

module.exports = Gasto;