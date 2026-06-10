const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/usuariosController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole }   = require('../middlewares/roleMiddleware');

router.get('/',      verifyToken, checkRole('admin'), ctrl.getAll);
router.get('/:id',   verifyToken, ctrl.getById);          // secretaria puede ver su propio perfil
router.post('/',     verifyToken, checkRole('admin'), ctrl.create);
router.put('/:id',   verifyToken, ctrl.update);            // admin edita cualquiera, secretaria solo a sí misma
router.delete('/:id',verifyToken, checkRole('admin'), ctrl.remove);

module.exports = router;