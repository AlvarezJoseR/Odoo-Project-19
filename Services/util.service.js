const odooQuery = require('./../Odoo/odoo.connection');

/**
 * Obtiene la definición de un modelo de Odoo usando el método fields_get. Realiza una consulta al modelo especificado y retorna los atributos de sus campos (help, string, type).
 * @param {string} model_name - Nombre del modelo de Odoo a consultar (por ejemplo, 'res.partner').
 * @returns {Promise<{statusCode: number, message: string, data: object}>} Objeto con el resultado de la consulta, mensaje y definición del modelo o error si no existe.
 */
exports.getModel = async (model_name) => {
    try {
        //Validar que se haya enviado el nombre del modelo
        if (!model_name) return { statusCode: 400, message: "No se ha enviado el nombre de ningun modelo", data: [] };

        //Obtener el modelo
        const model = await odooQuery.query( model_name, "fields_get",{ attributes: ["help", "string", "type"] });
        if (model.error) return { statusCode: model.status, message: model.message, data: model.data };
        if (!model.success) return { statusCode: 400, message: model.message, data: model.data.data.message };

        //Regresar el modelo
        return {statusCode: 200, message: "Modelo obtenido.", data: model.data }
    }catch(e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }

}