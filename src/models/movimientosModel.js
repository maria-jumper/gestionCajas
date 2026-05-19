const db = require('../config/db');

class Movimiento {
    // Obtener historial de movimientos con el nombre del cajero
    static async findAll() {
        const query = `
            SELECT m.*, u.nombre as cajero 
            FROM movimientos m 
            LEFT JOIN usuarios u ON m.usuario_id = u.id 
            ORDER BY m.fecha DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    // Calcular el balance del día actual
    static async getBalanceDiario() {
        const [ingresosEfectivo] = await db.query(`
            SELECT COALESCE(SUM(valor), 0) AS total 
            FROM movimientos WHERE metodo_pago = 'EFECTIVO' AND DATE(fecha) = CURDATE()
        `);

        const [ingresosTransferencia] = await db.query(`
            SELECT COALESCE(SUM(valor), 0) AS total 
            FROM movimientos WHERE metodo_pago = 'TRANSFERENCIA' AND DATE(fecha) = CURDATE()
        `);

        const [gastos] = await db.query(`
            SELECT COALESCE(SUM(valor), 0) AS total 
            FROM gastos WHERE DATE(fecha) = CURDATE()
        `);

        const efectivoNeto = ingresosEfectivo[0].total - gastos[0].total;

        return {
            ingresos_efectivo: ingresosEfectivo[0].total,
            ingresos_transferencia: ingresosTransferencia[0].total,
            gastos: gastos[0].total,
            efectivo_en_caja: efectivoNeto,
            total_facturado: (ingresosEfectivo[0].total + ingresosTransferencia[0].total)
        };
    }
}

module.exports = Movimiento;