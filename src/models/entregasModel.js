const db = require('../config/db');

class Entrega {
    static async createWithTransaction({ guia, precio, metodo_pago, productos, usuario_id }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Crear el registro de la entrega
            const [entregaResult] = await connection.query(
                "INSERT INTO entregas (guia, precio, metodo_pago, usuario_id, estado) VALUES (?, ?, ?, ?, 'entregado')",
                [guia, precio, metodo_pago, usuario_id]
            );
            const entregaId = entregaResult.insertId;

            // 2. Insertar detalles y descontar stock
            for (const p of productos) {
                // Registrar detalle
                await connection.query(
                    "INSERT INTO detalle_entregas (entrega_id, inventario_id, cantidad) VALUES (?, ?, ?)",
                    [entregaId, p.inventario_id, p.cantidad]
                );

                // Descontar del inventario
                await connection.query(
                    "UPDATE inventario SET stock = stock - ? WHERE id = ?",
                    [p.cantidad, p.inventario_id]
                );
            }

            // 3. Registrar el ingreso de dinero en caja
            await connection.query(
                "INSERT INTO movimientos (tipo, referencia_id, valor, metodo_pago, usuario_id) VALUES ('ENTREGA', ?, ?, ?, ?)",
                [entregaId, precio, metodo_pago, usuario_id]
            );

            await connection.commit();
            return entregaId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Entrega;