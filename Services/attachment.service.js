/**
 * Obtiene adjuntos filtrados por los parámetros dados.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Archivo' }).
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
const e = require('express');
const odooService = require('../Odoo/odoo.connection');

/**
 * Obtiene un adjunto por su ID.
 * @param {number|string} id - ID del adjunto a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
exports.getById = async (id) => {
    try {
        const attachmentId = Number(id);
        if (isNaN(attachmentId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        const attachment = await odooService.query('ir.attachment', 'search_read', {domain: [['id', '=', attachmentId]], fields: ['id', 'name', 'res_model', 'res_id'] });

        if (attachment.error) return { statusCode: 500, message: attachment.message, data: attachment.data };
        if (!attachment.success) return { statusCode: 400, message: attachment.message, data: attachment.data?.data?.message };
        if (!attachment.data || attachment.data.length === 0) return { statusCode: 404, message: `No se encontró ningún attachment con id ${attachmentId}`, data: [] };
        return { statusCode: 200, message: 'Attachment obtenido con éxito', data: attachment.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Crea un nuevo adjunto en Odoo.
 * @param {string} model - Nombre del modelo relacionado.
 * @param {number|string} model_id - ID del modelo relacionado.
 * @param {Object} attachment - Objeto del archivo adjunto.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
exports.createAttachment = async ( model, model_id, attachment) => {
    try {
        //Validar que se haya enviado el modelo
        if (!model) return { statusCode: 400, message: "El parámetro 'model' es obligatorio.", data: [] };

        //Validar que el id del modelo sea un número
        const relatedId = Number(model_id);
        if (isNaN(relatedId)) return { statusCode: 400, message: `El id del modelo relacionado '${model_id}' no es válido. Debe ser un número.`, data: [] };

        //Crear el archivo
        const base64File = attachment.buffer.toString('base64');

        //Validar que exista un registro en el modelo relacionado con ese ID
        const relatedRecord = await odooService.query(model, 'search_read', { domain: [['id', '=', relatedId]], fields: ['id'] });
        if (relatedRecord.error) return { statusCode: 500, message: relatedRecord.message, data: relatedRecord.data };
        if (!relatedRecord.success) return { statusCode: 400, message: relatedRecord.message, data: relatedRecord.data?.data?.message };
        if (!relatedRecord.data || relatedRecord.data.length === 0) return { statusCode: 404, message: `No se encontró ningún registro en el modelo '${model}' con id ${relatedId}`, data: [] };
        
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

/**
 * Elimina un adjunto por su ID.
 * @param {number|string} id - ID del adjunto a eliminar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
exports.delete = async (id) => {
    try {
        // Validar que el id sea un número
        const attachmentId = Number(id);
        if (isNaN(attachmentId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };
        
        //Verificar que el attachment existe
        const attachment = await this.getById(attachmentId);
        if (attachment.statusCode !== 200) return attachment;
        
        //Eliminar el attachment
        const response = await odooService.query('ir.attachment', 'unlink', { ids: [attachmentId] });
        if (response.error) return { statusCode: 500, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        
        //Retornar exito
        return { statusCode: 200, message: "Attachment eliminado con éxito.", data: [] };
    } catch (e) {
        console.error(e);
         return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
