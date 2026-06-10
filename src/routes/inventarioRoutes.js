const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/inventarioController');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET  /api/inventario              → lista todas las guías (con filtros opcionales ?guia=&estado=)
router.get('/',                verifyToken, ctrl.obtenerInventario);

// GET  /api/inventario/guia/:codigo → buscar guía exacta por número
router.get('/guia/:codigo',    verifyToken, ctrl.buscarPorGuia);

// POST /api/inventario              → crear una guía
router.post('/',               verifyToken, ctrl.crearGuia);

// POST /api/inventario/importar     → importar array de guías desde Excel
router.post('/importar',       verifyToken, ctrl.importarGuias);

// PUT  /api/inventario/:id          → actualizar estado u otros campos de una guía
router.put('/:id',             verifyToken, ctrl.actualizarGuia);

// DELETE /api/inventario/:id        → eliminar una guía
router.delete('/:id',          verifyToken, ctrl.eliminarGuia);

module.exports = router;