const e = require('express');
const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const attachmentId = Number(id);
        if (isNaN(attachmentId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const attachment = await odooService.query('ir.attachment', 'search_read', {domain: [['id', '=', attachmentId]], fields: ['id', 'name', 'res_model', 'res_id'] });

        if (attachment.error) return { statusCode: 500, message: attachment.message, data: attachment.data };
        if (!attachment.success) return { statusCode: 400, message: attachment.message, data: attachment.data?.data?.message };
        if (!attachment.data || attachment.data.length === 0) return { statusCode: 404, message: `No se encontró ningún attachment con id ${attachmentId}`, data: null };
        return { statusCode: 200, message: 'Attachment obtenido con éxito', data: attachment.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.createAttachment = async ( model, model_id, attachment) => {
    try {
        //Crear el archivo
        const base64File = attachment.buffer.toString('base64');

        //Crear la informacion del adjunto
        const attachmentData = {
            name: attachment.originalname,
            datas: base64File,
            res_model: model,
            res_id: Number(model_id),
            mimetype: attachment.mimetype,
        };

        //Agregar el adjunto
        const response = await odooService.query('ir.attachment', 'create', { vals_list: [attachmentData] });
        if (response.error) return { statusCode: 500, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: "Adjunto creado con éxito.", data: response.data };
    } catch (e) {
        console.error(e);
         return { statusCode: 500, message: "Error interno", data: e.message };
    }
}

exports.delete = async (id) => {
    try {
        // Validar que el id sea un número
        const attachmentId = Number(id);
        if (isNaN(attachmentId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };
        
        //Verificar que el attachment existe
        const attachment = await this.getById(attachmentId);
        if (attachment.statusCode !== 200) return attachment;
        
        //Eliminar el attachment
        const response = await odooService.query('ir.attachment', 'unlink', { ids: [attachmentId] });
        if (response.error) return { statusCode: 500, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        
        //Retornar exito
        return { statusCode: 200, message: "Attachment eliminado con éxito.", data: null };
    } catch (e) {
        console.error(e);
         return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
