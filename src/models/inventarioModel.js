const db = require('../config/db');

// Convierte cualquier formato de fecha a YYYY-MM-DD
function normalizarFecha(fecha) {
  if (!fecha) return new Date().toISOString().split('T')[0];
  const s = String(fecha).trim();
  if (!s) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
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
      const BATCH = 100;
      let insertadas = 0, actualizadas = 0;

      for (let i = 0; i < guias.length; i += BATCH) {
        const lote = guias.slice(i, i + BATCH).filter(g => g.guia);
        if (!lote.length) continue;

        const valores = lote.map(g => [
          String(g.guia).trim(),
          g.cliente        || null,
          g.destinatario   || null,
          g.direccion      || null,
          g.telefono       || null,
          parseFloat(String(g.valor || '0').replace(/[^0-9.]/g, '')) || 0,
          g.ciudad         || null,
          g.observaciones  || null,
          normalizarFecha(g.fecha),
        ]);

        const placeholders = lote.map(() => "(?,?,?,?,?,?,?,?,?,'No entregado')").join(',');

        const [result] = await conn.query(
          `INSERT INTO inventario
             (guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, fecha, estado)
           VALUES ${placeholders}
           ON DUPLICATE KEY UPDATE
             cliente       = COALESCE(VALUES(cliente),       cliente),
             destinatario  = COALESCE(VALUES(destinatario),  destinatario),
             direccion     = COALESCE(VALUES(direccion),     direccion),
             telefono      = COALESCE(VALUES(telefono),      telefono),
             valor         = COALESCE(VALUES(valor),         valor),
             ciudad        = COALESCE(VALUES(ciudad),        ciudad),
             observaciones = COALESCE(VALUES(observaciones), observaciones),
             fecha         = VALUES(fecha)`,
          valores.flat()
        );

        // En MySQL: affectedRows = 1 por insert nuevo, 2 por update
        const upd = result.affectedRows - lote.length;
        actualizadas += upd;
        insertadas   += lote.length - upd;
      }

      return { insertadas, actualizadas };
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