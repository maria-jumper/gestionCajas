const inventarioService = require('../services/inventarioService');

exports.obtenerInventario = async (req, res, next) => {
    try {
        const productos = await inventarioService.obtenerTodoElInventario();
        res.json(productos);
    } catch (error) {
        next(error);
    }
};

exports.crearProducto = async (req, res, next) => {
    try {
        const productoId = await inventarioService.registrarProducto(req.body);
        res.status(201).json({ msg: "Producto creado", id: productoId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.actualizarStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        
        await inventarioService.modificarStock(id, stock);
        res.json({ msg: "Stock actualizado correctamente" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};