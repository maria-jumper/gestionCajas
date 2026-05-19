const db = require('../config/db');

class Envio {
    static async createWithTransaction({ guia, precio, destino, usuario_id }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insertar el envío
            const [envioResult] = await connection.query(
                "INSERT INTO envios (guia, precio, destino, usuario_id) VALUES (?, ?, ?, ?)",
                [guia, precio, destino, usuario_id]
            );
            const envioId = envioResult.insertId;

            // 2. Registrar el movimiento en caja (asumimos EFECTIVO por defecto para envíos, o puedes pasarlo como parámetro)
            await connection.query(
                "INSERT INTO movimientos (tipo, referencia_id, valor, metodo_pago, usuario_id) VALUES ('ENVIO', ?, ?, 'EFECTIVO', ?)",
                [envioId, precio, usuario_id]
            );

            await connection.commit();
            return envioId;
        } catch (error) {
            await connection.rollback();
            throw error; // Lanza el error para que el controlador lo capture y envíe el res.status(500)
        } finally {
            connection.release();
        }
    }
}

module.exports = Envio;