const gastoService = require('../services/gastoService');
const response = require('../utils/response'); // Importar el utilitario

exports.obtenerGastos = async (req, res, next) => {
    try {
        const gastos = await gastoService.obtenerTodosLosGastos();
        // Usar la respuesta de éxito estandarizada
        return response.success(res, "Gastos obtenidos correctamente", gastos);
    } catch (error) {
        next(error); 
    }
};

exports.crearGasto = async (req, res, next) => {
    try {
        const gastoId = await gastoService.crearNuevoGasto(req.body, req.user.id);
        return response.success(res, "Gasto registrado con éxito", { id: gastoId }, 201);
    } catch (error) {
        // Usar la respuesta de error estandarizada (ej. si falla la validación)
        return response.error(res, error.message, 400);
    }
};