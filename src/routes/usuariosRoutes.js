const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/usuariosController');

// Usa el mismo middleware que el resto de tu proyecto
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole }   = require('../middlewares/roleMiddleware');

// GET    /api/usuarios      → lista todos
router.get('/',     verifyToken, checkRole('admin'), controller.getAll);

// POST   /api/usuarios      → crea uno nuevo
router.post('/',    verifyToken, checkRole('admin'), controller.create);

// DELETE /api/usuarios/:id  → elimina por id
router.delete('/:id', verifyToken, checkRole('admin'), controller.remove);

module.exports = router;