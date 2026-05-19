const db = require('../config/db');

class Inventario {
    static async findAll() {
        const [rows] = await db.query("SELECT * FROM inventario ORDER BY nombre_producto ASC");
        return rows;
    }

    static async create(nombre_producto, stock) {
        const [result] = await db.query(
            "INSERT INTO inventario (nombre_producto, stock) VALUES (?, ?)",
            [nombre_producto, stock]
        );
        return result.insertId;
    }

    static async updateStock(id, stock) {
        const [result] = await db.query(
            "UPDATE inventario SET stock = ? WHERE id = ?",
            [stock, id]
        );
        return result.affectedRows;
    }
}

module.exports = Inventario;