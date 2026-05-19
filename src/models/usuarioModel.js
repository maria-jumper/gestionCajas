const db = require('../config/db'); // ajusta si tu ruta es diferente

class Usuario {
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0];
    }

    static async create(userData) {
        const { username, nombre, password, rol } = userData;
        const [result] = await db.query(
            'INSERT INTO usuarios (username, nombre, password, rol) VALUES (?, ?, ?, ?)',
            [username, nombre, password, rol || 'secretaria']
        );
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.query(
            'SELECT id, username, nombre, rol, creado_en FROM usuarios'
        );
        return rows;
    }

    // Nuevo método requerido por usuariosController
    static async deleteById(id) {
        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    }
}

module.exports = Usuario;