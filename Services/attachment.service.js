const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const attachmentId = Number(id);
        if (isNaN(attachmentId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const attachment = await odooService.query("object", "execute_kw", ['ir.attachment', 'search_read', [[['id', '=', attachmentId]]], {fields: ['id', 'name', 'datas_fname', 'res_model', 'res_id']}] );

        if (attachment.error) return { statusCode: 500, message: attachment.message, data: attachment };
        if (!attachment.success) return { statusCode: 400, message: attachment.message, data: attachment.data?.data?.message };
        if (!attachment.data || attachment.data.length === 0) return { statusCode: 404, message: `No se encontró ningún attachment con id ${attachmentId}`, data: null };
        return { statusCode: 200, message: 'Attachment obtenido con éxito', data: attachment.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
