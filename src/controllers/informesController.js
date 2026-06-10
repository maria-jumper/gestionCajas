const pool = require('../config/db');

// GET /api/informes/cierre-dia?fecha=YYYY-MM-DD
exports.getCierreDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

    // 1. Totales de entregas por secretaria en esa fecha
    const [entregas] = await pool.query(
      `SELECT e.usuario_id, u.nombre, u.username,
              COUNT(e.id) AS entregas_count,
              COALESCE(SUM(e.precio), 0) AS total_entregas,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'guia', e.guia,
                  'tipo', 'Entrega',
                  'valor', e.precio,
                  'metodo_pago', e.metodo_pago,
                  'hora', DATE_FORMAT(e.fecha, '%H:%i')
                )
              ) AS movimientos_entregas
       FROM entregas e
       LEFT JOIN usuarios u ON e.usuario_id = u.id
       WHERE DATE(e.fecha) = ?
       GROUP BY e.usuario_id, u.nombre, u.username`,
      [fecha]
    );

    // 2. Totales de envíos por secretaria
    const [envios] = await pool.query(
      `SELECT en.usuario_id,
              COUNT(en.id) AS envios_count,
              COALESCE(SUM(en.valor), 0) AS total_envios,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'guia', en.guia,
                  'tipo', 'Envío',
                  'valor', en.valor,
                  'metodo_pago', en.metodo_pago,
                  'hora', DATE_FORMAT(en.fecha, '%H:%i')
                )
              ) AS movimientos_envios
       FROM envios en
       WHERE DATE(en.fecha) = ?
       GROUP BY en.usuario_id`,
      [fecha]
    );

    // 3. Total gastos del día
    const [gastos] = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS total_gastos FROM gastos WHERE fecha = ?`,
      [fecha]
    );

    // 4. Verificar si ya fue cerrado
    const [cierre] = await pool.query(
      `SELECT * FROM cierres_caja WHERE fecha = ? LIMIT 1`, [fecha]
    );

    // Combinar datos por secretaria
    const mapaSecretarias = {};

    for (const e of entregas) {
      const uid = e.usuario_id;
      if (!mapaSecretarias[uid]) {
        mapaSecretarias[uid] = {
          id:              uid,
          nombre:          e.nombre || 'Sin nombre',
          username:        e.username || '',
          entregas_count:  0,
          envios_count:    0,
          total_entregas:  0,
          total_envios:    0,
          total_dia:       0,
          movimientos:     [],
        };
      }
      mapaSecretarias[uid].entregas_count = e.entregas_count;
      mapaSecretarias[uid].total_entregas = parseFloat(e.total_entregas);
      const movE = typeof e.movimientos_entregas === 'string'
        ? JSON.parse(e.movimientos_entregas) : e.movimientos_entregas || [];
      mapaSecretarias[uid].movimientos.push(...movE);
    }

    for (const en of envios) {
      const uid = en.usuario_id;
      if (!mapaSecretarias[uid]) {
        mapaSecretarias[uid] = {
          id: uid, nombre: 'Sin nombre', username: '',
          entregas_count:0, envios_count:0,
          total_entregas:0, total_envios:0, total_dia:0, movimientos:[],
        };
      }
      mapaSecretarias[uid].envios_count  = en.envios_count;
      mapaSecretarias[uid].total_envios  = parseFloat(en.total_envios);
      const movEn = typeof en.movimientos_envios === 'string'
        ? JSON.parse(en.movimientos_envios) : en.movimientos_envios || [];
      mapaSecretarias[uid].movimientos.push(...movEn);
    }

    // Calcular total_dia por secretaria
    const secretarias = Object.values(mapaSecretarias).map(s => ({
      ...s,
      total_dia: s.total_entregas + s.total_envios,
    }));

    const totalEntregas = secretarias.reduce((s, x) => s + x.total_entregas, 0);
    const totalEnvios   = secretarias.reduce((s, x) => s + x.total_envios, 0);
    const totalGeneral  = totalEntregas + totalEnvios;
    const totalGastos   = parseFloat(gastos[0]?.total_gastos || 0);

    res.json({
      fecha,
      secretarias,
      total_entregas: totalEntregas,
      total_envios:   totalEnvios,
      total_general:  totalGeneral,
      total_gastos:   totalGastos,
      neto:           totalGeneral - totalGastos,
      cerrado:        cierre.length > 0,
    });
  } catch (error) {
    console.error('Error getCierreDia:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/informes/cierre-dia — guardar cierre
exports.cerrarCaja = async (req, res) => {
  try {
    const { fecha, datos } = req.body;
    const cerrado_por = req.user?.id;

    if (!fecha) return res.status(400).json({ error: 'La fecha es obligatoria' });

    // Verificar si ya existe
    const [existe] = await pool.query(
      'SELECT id FROM cierres_caja WHERE fecha = ?', [fecha]
    );
    if (existe.length) {
      return res.status(409).json({ error: 'La caja ya fue cerrada para esta fecha' });
    }

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
