const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const bankAccountId = Number(id);
        if (isNaN(bankAccountId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const bankAccount = await odooService.query("object", "execute_kw", ['res.partner.bank', 'search_read', [[['id', '=', bankAccountId]]], {fields: ['id', 'acc_number', 'bank_name', 'partner_id']}] );

        if (bankAccount.error) return { statusCode: 500, message: bankAccount.message, data: bankAccount };
        if (!bankAccount.success) return { statusCode: 400, message: bankAccount.message, data: bankAccount.data?.data?.message };
        if (!bankAccount.data || bankAccount.data.length === 0) return { statusCode: 404, message: `No se encontró ningún bankAccount con id ${bankAccountId}`, data: null };
        return { statusCode: 200, message: 'BankAccount obtenido con éxito', data: bankAccount.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
