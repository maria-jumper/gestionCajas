const Inventario = require('../models/inventarioModel');

exports.obtenerTodoElInventario = async () => {
    return await Inventario.findAll();
};

exports.registrarProducto = async (data) => {
    if (!data.nombre_producto || data.nombre_producto.trim() === '') {
        throw new Error('El nombre del producto es obligatorio.');
    }

    if (data.stock < 0) {
        throw new Error('El stock inicial no puede ser negativo.');
    }

    const productoId = await Inventario.create(data.nombre_producto, data.stock);
    return productoId;
};

exports.modificarStock = async (id, nuevoStock) => {
    if (nuevoStock < 0) {
        throw new Error('El stock no puede ser un valor negativo.');
    }

    const filasAfectadas = await Inventario.updateStock(id, nuevoStock);
    
    if (filasAfectadas === 0) {
        throw new Error('Producto no encontrado.');
    }

    return true;
};