const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const invoice = await odooService.query("object", "execute_kw", ['account.move', 'search_read', [[['id', '=', invoiceId]]], {fields: ['id', 'name', 'move_type', 'partner_id', 'amount_total']}] );

        if (invoice.error) return { statusCode: 500, message: invoice.message, data: invoice };
        if (!invoice.success) return { statusCode: 400, message: invoice.message, data: invoice.data?.data?.message };
        if (!invoice.data || invoice.data.length === 0) return { statusCode: 404, message: `No se encontró ningún invoice con id ${invoiceId}`, data: null };
        return { statusCode: 200, message: 'Invoice obtenido con éxito', data: invoice.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
