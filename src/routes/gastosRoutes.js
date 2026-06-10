const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/gastosController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/',      verifyToken, ctrl.obtenerGastos);
router.post('/',     verifyToken, ctrl.crearGasto);
router.delete('/:id',verifyToken, ctrl.eliminarGasto);

module.exports = router;