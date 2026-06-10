const db = require('../config/db');

class Entrega {
  static async findAll({ fecha, usuario_id } = {}) {
    let sql = `SELECT e.*, u.nombre AS nombre_secretaria
               FROM entregas e LEFT JOIN usuarios u ON e.usuario_id = u.id WHERE 1=1`;
    const params = [];
    if (fecha)      { sql += ' AND DATE(e.fecha) = ?'; params.push(fecha); }
    if (usuario_id) { sql += ' AND e.usuario_id = ?';  params.push(usuario_id); }
    sql += ' ORDER BY e.fecha DESC';
    const [rows] = await db.query(sql, params);
    return rows;
  }

  // Registrar entrega y actualizar inventario en una transacción
  static async createWithTransaction({ guia, valor, metodo_pago, referencia, id_inventario, cliente, usuario_id }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Normalizar método de pago
      const metodoDB = metodo_pago === 'efectivo'   ? 'EFECTIVO'
                     : metodo_pago === 'transaccion' ? 'TRANSFERENCIA'
                     : (metodo_pago || 'EFECTIVO').toUpperCase();

      // 1. Insertar entrega
      const [result] = await conn.query(
        `INSERT INTO entregas (guia, valor, estado, metodo_pago, referencia, id_inventario, cliente, usuario_id, fecha)
         VALUES (?, ?, 'entregado', ?, ?, ?, ?, ?, NOW())`,
        [guia, parseFloat(valor)||0, metodoDB, referencia||null,
         id_inventario||null, cliente||null, usuario_id]
      );
      const entregaId = result.insertId;

      // 2. Actualizar estado en inventario
      if (id_inventario) {
        await conn.query(
          `UPDATE inventario SET estado = 'Entregado', metodo_pago = ? WHERE id = ?`,
          [metodoDB, id_inventario]
        );
      } else {
        await conn.query(
          `UPDATE inventario SET estado = 'Entregado', metodo_pago = ? WHERE guia = ?`,
          [metodoDB, guia]
        );
      }

      // 3. Registrar movimiento en caja
      await conn.query(
        `INSERT INTO movimientos (tipo, referencia_id, valor, metodo_pago, usuario_id)
         VALUES ('ENTREGA', ?, ?, ?, ?)`,
        [entregaId, parseFloat(valor)||0, metodoDB, usuario_id]
      );

      await conn.commit();
      return entregaId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = Entrega;