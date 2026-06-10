const pool = require('../config/db');

// GET /api/informes/cierre-dia?fecha=YYYY-MM-DD
exports.getCierreDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

    // 1. Entregas por usuario (incluye admin y secretarias)
    const [entregas] = await pool.query(
      `SELECT
        e.usuario_id,
        u.nombre,
        u.username,
        u.rol,
        COUNT(e.id) AS entregas_count,
        COALESCE(SUM(e.valor), 0) AS total_entregas,
        COALESCE(SUM(CASE WHEN UPPER(e.metodo_pago) = 'EFECTIVO' THEN e.valor ELSE 0 END), 0) AS efectivo_entregas,
        COALESCE(SUM(CASE WHEN UPPER(e.metodo_pago) != 'EFECTIVO' THEN e.valor ELSE 0 END), 0) AS transferencia_entregas,
        JSON_ARRAYAGG(JSON_OBJECT(
          'guia', e.guia,
          'tipo', 'Entrega',
          'valor', e.valor,
          'metodo_pago', e.metodo_pago,
          'hora', DATE_FORMAT(e.fecha, '%H:%i')
        )) AS movimientos_json
       FROM entregas e
       LEFT JOIN usuarios u ON e.usuario_id = u.id
       WHERE DATE(e.fecha) = ?
       GROUP BY e.usuario_id, u.nombre, u.username, u.rol`,
      [fecha]
    );

    // 2. Envíos por usuario
    const [envios] = await pool.query(
      `SELECT
        en.usuario_id,
        COUNT(en.id) AS envios_count,
        COALESCE(SUM(en.valor), 0) AS total_envios,
        COALESCE(SUM(CASE WHEN UPPER(en.metodo_pago) = 'EFECTIVO' THEN en.valor ELSE 0 END), 0) AS efectivo_envios,
        COALESCE(SUM(CASE WHEN UPPER(en.metodo_pago) != 'EFECTIVO' THEN en.valor ELSE 0 END), 0) AS transferencia_envios,
        JSON_ARRAYAGG(JSON_OBJECT(
          'guia', en.guia,
          'tipo', 'Envío',
          'valor', en.valor,
          'metodo_pago', en.metodo_pago,
          'hora', DATE_FORMAT(en.fecha, '%H:%i')
        )) AS movimientos_json
       FROM envios en
       WHERE DATE(en.fecha) = ?
       GROUP BY en.usuario_id`,
      [fecha]
    );

    // 3. Gastos del día
    const [gastos] = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS total_gastos FROM gastos WHERE fecha = ?`,
      [fecha]
    );

    // 4. Cierre previo
    const [cierre] = await pool.query(
      `SELECT * FROM cierres_caja WHERE fecha = ? LIMIT 1`, [fecha]
    );

    // Combinar por usuario
    const mapa = {};

    for (const e of entregas) {
      const uid = e.usuario_id;
      const movs = typeof e.movimientos_json === 'string'
        ? JSON.parse(e.movimientos_json || '[]') : (e.movimientos_json || []);

      mapa[uid] = {
        id:                   uid,
        nombre:               e.nombre || 'Sin nombre',
        username:             e.username || '',
        rol:                  e.rol || 'secretaria',
        entregas_count:       Number(e.entregas_count),
        envios_count:         0,
        total_entregas:       parseFloat(e.total_entregas),
        total_envios:         0,
        total_efectivo:       parseFloat(e.efectivo_entregas),
        total_transferencia:  parseFloat(e.transferencia_entregas),
        total_dia:            parseFloat(e.total_entregas),
        movimientos:          movs,
      };
    }

    for (const en of envios) {
      const uid = en.usuario_id;
      const movs = typeof en.movimientos_json === 'string'
        ? JSON.parse(en.movimientos_json || '[]') : (en.movimientos_json || []);

      if (mapa[uid]) {
        mapa[uid].envios_count        += Number(en.envios_count);
        mapa[uid].total_envios        += parseFloat(en.total_envios);
        mapa[uid].total_efectivo      += parseFloat(en.efectivo_envios);
        mapa[uid].total_transferencia += parseFloat(en.transferencia_envios);
        mapa[uid].total_dia           += parseFloat(en.total_envios);
        mapa[uid].movimientos          = [...mapa[uid].movimientos, ...movs];
      } else {
        // Usuario que solo tiene envíos (necesitamos su nombre)
        const [uInfo] = await pool.query(
          'SELECT nombre, username, rol FROM usuarios WHERE id = ?', [uid]
        );
        mapa[uid] = {
          id:                   uid,
          nombre:               uInfo[0]?.nombre || 'Sin nombre',
          username:             uInfo[0]?.username || '',
          rol:                  uInfo[0]?.rol || 'secretaria',
          entregas_count:       0,
          envios_count:         Number(en.envios_count),
          total_entregas:       0,
          total_envios:         parseFloat(en.total_envios),
          total_efectivo:       parseFloat(en.efectivo_envios),
          total_transferencia:  parseFloat(en.transferencia_envios),
          total_dia:            parseFloat(en.total_envios),
          movimientos:          movs,
        };
      }
    }

    const secretarias       = Object.values(mapa);
    const totalEntregas     = secretarias.reduce((s, x) => s + x.total_entregas, 0);
    const totalEnvios       = secretarias.reduce((s, x) => s + x.total_envios, 0);
    const totalGeneral      = totalEntregas + totalEnvios;
    const totalTransferencias = secretarias.reduce((s, x) => s + x.total_transferencia, 0);
    const totalGastos       = parseFloat(gastos[0]?.total_gastos || 0);

    res.json({
      fecha,
      secretarias,
      total_entregas:       totalEntregas,
      total_envios:         totalEnvios,
      total_general:        totalGeneral,
      total_transferencias: totalTransferencias,
      total_gastos:         totalGastos,
      neto:                 totalGeneral - totalGastos,
      cerrado:              cierre.length > 0,
    });

  } catch (error) {
    console.error('Error getCierreDia:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/informes/cierre-dia
exports.cerrarCaja = async (req, res) => {
  try {
    const { fecha, datos } = req.body;
    const cerrado_por = req.user?.id;
    if (!fecha) return res.status(400).json({ error: 'La fecha es obligatoria' });

    const [existe] = await pool.query(
      'SELECT id FROM cierres_caja WHERE fecha = ?', [fecha]
    );
    if (existe.length)
      return res.status(409).json({ error: 'La caja ya fue cerrada para esta fecha' });

    await pool.query(
      `INSERT INTO cierres_caja (fecha, total_entregas, total_envios, total_gastos, total_general, neto, datos_json, cerrado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha,
       datos?.total_entregas || 0,
       datos?.total_envios   || 0,
       datos?.total_gastos   || 0,
       datos?.total_general  || 0,
       datos?.neto           || 0,
       JSON.stringify(datos  || {}),
       cerrado_por]
    );

    res.status(201).json({ msg: 'Caja cerrada correctamente', fecha });
  } catch (error) {
    console.error('Error cerrarCaja:', error);
    res.status(500).json({ error: error.message });
  }
};