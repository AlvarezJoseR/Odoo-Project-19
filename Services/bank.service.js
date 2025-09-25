const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const bankId = Number(id);
        if (isNaN(bankId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const bank = await odooService.query("object", "execute_kw", ['res.bank', 'search_read', [[['id', '=', bankId]]], {fields: ['id', 'name', 'bic', 'active']}] );

        if (bank.error) return { statusCode: 500, message: bank.message, data: bank };
        if (!bank.success) return { statusCode: 400, message: bank.message, data: bank.data?.data?.message };
        if (!bank.data || bank.data.length === 0) return { statusCode: 404, message: `No se encontró ningún bank con id ${bankId}`, data: null };
        return { statusCode: 200, message: 'Bank obtenido con éxito', data: bank.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
