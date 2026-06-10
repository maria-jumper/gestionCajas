const pool = require('../config/db');

// GET /api/inventario — lista todas las guías
exports.obtenerInventario = async (req, res) => {
  try {
    const { guia, estado } = req.query;
    let sql = 'SELECT * FROM inventario WHERE 1=1';
    const params = [];

    if (guia) {
      sql += ' AND guia LIKE ?';
      params.push(`%${guia}%`);
    }
    if (estado) {
      sql += ' AND estado = ?';
      params.push(estado);
    }
    sql += ' ORDER BY fecha DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obtenerInventario:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/inventario/guia/:codigo — buscar guía exacta por código
exports.buscarPorGuia = async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM inventario WHERE guia = ? LIMIT 1',
      [codigo.trim()]
    );
    if (!rows.length) return res.status(404).json({ error: 'Guía no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error buscarPorGuia:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/inventario — crear una guía individual
exports.crearGuia = async (req, res) => {
  try {
    const { guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, fecha } = req.body;
    if (!guia) return res.status(400).json({ error: 'El número de guía es obligatorio' });

    const [result] = await pool.query(
      `INSERT INTO inventario (guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, estado, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'No entregado', ?)`,
      [guia, cliente||null, destinatario||null, direccion||null, telefono||null,
       parseFloat(valor)||0, ciudad||null, observaciones||null,
       fecha || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ id: result.insertId, msg: 'Guía creada' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: `La guía ya existe en el inventario` });
    console.error('Error crearGuia:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/inventario/importar — importar múltiples guías desde Excel
exports.importarGuias = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const guias = req.body; // array de guías
    if (!Array.isArray(guias) || !guias.length)
      return res.status(400).json({ error: 'Se esperaba un array de guías' });

    await conn.beginTransaction();

    let insertadas = 0, actualizadas = 0;

    for (const g of guias) {
      if (!g.guia) continue;

      // Verificar si ya existe
      const [existe] = await conn.query(
        'SELECT id FROM inventario WHERE guia = ?', [g.guia]
      );

      if (existe.length) {
        // Actualizar solo campos no vacíos
        await conn.query(
          `UPDATE inventario SET
            cliente       = COALESCE(?, cliente),
            destinatario  = COALESCE(?, destinatario),
            direccion     = COALESCE(?, direccion),
            telefono      = COALESCE(?, telefono),
            valor         = COALESCE(?, valor),
            ciudad        = COALESCE(?, ciudad),
            observaciones = COALESCE(?, observaciones),
            fecha         = COALESCE(?, fecha)
           WHERE guia = ?`,
          [g.cliente||null, g.destinatario||null, g.direccion||null, g.telefono||null,
           g.valor ? parseFloat(g.valor) : null, g.ciudad||null, g.observaciones||null,
           g.fecha||null, g.guia]
        );
        actualizadas++;
      } else {
        await conn.query(
          `INSERT INTO inventario (guia, cliente, destinatario, direccion, telefono, valor, ciudad, observaciones, estado, fecha)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'No entregado', ?)`,
          [g.guia, g.cliente||null, g.destinatario||null, g.direccion||null, g.telefono||null,
           parseFloat(g.valor)||0, g.ciudad||null, g.observaciones||null,
           g.fecha || new Date().toISOString().split('T')[0]]
        );
        insertadas++;
      }
    }

    await conn.commit();
    res.json({ msg: `Importación completada`, insertadas, actualizadas });
  } catch (error) {
    await conn.rollback();
    console.error('Error importarGuias:', error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

// PUT /api/inventario/:id — actualizar guía (estado, campos, etc.)
exports.actualizarGuia = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;

    // Campos permitidos para actualizar
    const permitidos = ['estado', 'cliente', 'destinatario', 'direccion', 'telefono',
                        'valor', 'ciudad', 'observaciones', 'metodo_pago'];
    const updates = [];
    const values  = [];

    for (const campo of permitidos) {
      if (campos[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        values.push(campos[campo]);
      }
    }

    if (!updates.length) return res.status(400).json({ error: 'No hay campos para actualizar' });

    values.push(id);
    await pool.query(`UPDATE inventario SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ msg: 'Guía actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizarGuia:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/inventario/:id
exports.eliminarGuia = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inventario WHERE id = ?', [id]);
    res.json({ msg: 'Guía eliminada' });
  } catch (error) {
    console.error('Error eliminarGuia:', error);
    res.status(500).json({ error: error.message });
  }
};