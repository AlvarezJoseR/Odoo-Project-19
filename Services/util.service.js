const odooQuery = require('./../Odoo/odoo.connection');

exports.getModel = async (model_name) => {
    try {
        if (!model_name) return { statusCode: 400, message: "No se ha enviado el nombre de ningun modelo", data: [] };
        const model = await odooQuery.query( model_name, "fields_get",{ attributes: ["help", "string", "type"] });
        if (model.error) return { statusCode: 500, message: model.message, data: model.data };
        if (!model.success) return { statusCode: 400, meessage: model.message, data: model.data.data.message };
        return {statusCode: 200, message: "Modelo obtenido.", data: model.data }
    }catch(e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: data.e };
    }

}