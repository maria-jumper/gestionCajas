const db = require('../config/db');

class Gasto {
    // Obtener todos los gastos con el nombre del usuario
    static async findAll() {
        const query = `
            SELECT g.*, u.nombre as usuario_nombre 
            FROM gastos g 
            LEFT JOIN usuarios u ON g.usuario_id = u.id 
            ORDER BY g.fecha DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    // Registrar un nuevo gasto
    static async create({ descripcion, valor, usuario_id }) {
        const [result] = await db.query(
            "INSERT INTO gastos (descripcion, valor, usuario_id) VALUES (?, ?, ?)",
            [descripcion, valor, usuario_id]
        );
        return result.insertId;
    }
}

module.exports = Gasto;