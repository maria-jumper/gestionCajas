const db = require('../config/db');

class Envio {
  static async findAll({ fecha, usuario_id } = {}) {
    let sql = `SELECT e.*, u.nombre AS nombre_secretaria
               FROM envios e LEFT JOIN usuarios u ON e.usuario_id = u.id WHERE 1=1`;
    const params = [];
    if (fecha)      { sql += ' AND DATE(e.fecha) = ?'; params.push(fecha); }
    if (usuario_id) { sql += ' AND e.usuario_id = ?';  params.push(usuario_id); }
    sql += ' ORDER BY e.fecha DESC';
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async createWithTransaction({ guia, valor, destinatario, cliente, metodo_pago, referencia, cantidad, usuario_id }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const metodoDB = metodo_pago === 'efectivo'   ? 'EFECTIVO'
                     : metodo_pago === 'transaccion' ? 'TRANSFERENCIA'
                     : (metodo_pago || 'EFECTIVO').toUpperCase();

      // 1. Insertar envío
      const [result] = await conn.query(
        `INSERT INTO envios (guia, valor, destinatario, cliente, metodo_pago, referencia, cantidad, usuario_id, fecha)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [guia, parseFloat(valor)||0, destinatario||null, cliente||null,
         metodoDB, referencia||null, cantidad||1, usuario_id]
      );
      const envioId = result.insertId;

      // 2. Registrar movimiento en caja
      await conn.query(
        `INSERT INTO movimientos (tipo, referencia_id, valor, metodo_pago, usuario_id)
         VALUES ('ENVIO', ?, ?, ?, ?)`,
        [envioId, parseFloat(valor)||0, metodoDB, usuario_id]
      );

      await conn.commit();
      return envioId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = Envio;