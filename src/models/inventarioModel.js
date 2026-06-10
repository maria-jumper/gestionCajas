const db = require('../config/db');

// Convierte cualquier formato de fecha a YYYY-MM-DD
function normalizarFecha(fecha) {
  if (!fecha) return new Date().toISOString().split('T')[0];
  const s = String(fecha).trim();
  if (!s) return new Date().toISOString().split('T')[0];
  // Ya está en YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY o D/M/YYYY (formato colombiano)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // Intentar con Date nativo
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return new Date().toISOString().split('T')[0];
}

class Inventario {
  static async findAll({ guia, estado } = {}) {
    let sql = 'SELECT * FROM inventario WHERE 1=1';
    const params = [];
    if (guia)   { sql += ' AND guia LIKE ?';  params.push(`%${guia}%`); }
    if (estado) { sql += ' AND estado = ?';    params.push(estado); }
    sql += ' ORDER BY creado_en DESC';
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async findByGuia(codigo) {
    const [rows] = await db.query('SELECT * FROM inventario WHERE guia = ? LIMIT 1', [codigo]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM inventario WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, fecha }) {
    const [result] = await db.query(
      `INSERT INTO inventario (guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, estado, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'No entregado', ?)`,
      [guia, cliente||null, destinatario||null, direccion||null, telefono||null,
       parseFloat(valor)||0, ciudad||null, observaciones||null,
       normalizarFecha(fecha)]
    );
    return result.insertId;
  }

  static async importar(guias) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      let insertadas = 0, actualizadas = 0;

      for (const g of guias) {
        if (!g.guia) continue;
        const fechaDB = normalizarFecha(g.fecha);
        const valor   = parseFloat(String(g.valor || '0').replace(/[^0-9.]/g, '')) || 0;

        const [existe] = await conn.query('SELECT id FROM inventario WHERE guia = ?', [String(g.guia).trim()]);

        if (existe.length) {
          await conn.query(
            `UPDATE inventario SET
              cliente       = COALESCE(?, cliente),
              destinatario  = COALESCE(?, destinatario),
              direccion     = COALESCE(?, direccion),
              telefono      = COALESCE(?, telefono),
              valor         = COALESCE(?, valor),
              ciudad        = COALESCE(?, ciudad),
              observaciones = COALESCE(?, observaciones),
              fecha         = ?
             WHERE guia = ?`,
            [g.cliente||null, g.destinatario||null, g.direccion||null,
             g.telefono||null, valor||null, g.ciudad||null,
             g.observaciones||null, fechaDB, String(g.guia).trim()]
          );
          actualizadas++;
        } else {
          await conn.query(
            `INSERT INTO inventario (guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, estado, fecha)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'No entregado', ?)`,
            [String(g.guia).trim(), g.cliente||null, g.destinatario||null,
             g.direccion||null, g.telefono||null, valor,
             g.ciudad||null, g.observaciones||null, fechaDB]
          );
          insertadas++;
        }
      }

      await conn.commit();
      return { insertadas, actualizadas };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async update(id, campos) {
    const permitidos = ['estado','cliente','destinatario','direccion','telefono',
                        'valor','ciudad','observaciones','metodo_pago'];
    const updates = [], values = [];
    for (const k of permitidos) {
      if (campos[k] !== undefined) { updates.push(`${k} = ?`); values.push(campos[k]); }
    }
    if (!updates.length) return 0;
    values.push(id);
    const [result] = await db.query(`UPDATE inventario SET ${updates.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    await db.query('DELETE FROM inventario WHERE id = ?', [id]);
  }
}

module.exports = Inventario;