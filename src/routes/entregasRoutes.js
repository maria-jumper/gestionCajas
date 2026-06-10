const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/entregasController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/',  verifyToken, ctrl.obtenerEntregas);
router.post('/', verifyToken, ctrl.registrarEntrega);

module.exports = router;