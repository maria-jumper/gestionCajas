const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/informesController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole }   = require('../middlewares/roleMiddleware');

router.get('/cierre-dia',  verifyToken, checkRole('admin'), ctrl.getCierreDia);
router.post('/cierre-dia', verifyToken, checkRole('admin'), ctrl.cerrarCaja);

module.exports = router;