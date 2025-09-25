const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const bankId = Number(id);
        if (isNaN(bankId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const bank = await odooService.query('res.bank', 'search_read', { domain: [['id', '=', bankId]] }, { fields: ['id', 'name', 'bic', 'active'] });
        if (bank.error) return { statusCode: 500, message: bank.message, data: bank };
        if (!bank.success) return { statusCode: 400, message: bank.message, data: bank.data?.data?.message };
        if (!bank.data || bank.data.length === 0) return { statusCode: 404, message: `No se encontró ningún bank con id ${bankId}`, data: null };
        return { statusCode: 200, message: 'Bank obtenido con éxito', data: bank.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.create = async (bankInfo) => {
    try {
        const newBank = await odooService.query('res.bank', 'create', { vals_list: [bankInfo] });
        if (newBank.error) return { statusCode: 500, message: newBank.message, data: newBank };
        if (!newBank.success) return { statusCode: 400, message: newBank.message, data: newBank.data?.data?.message };
        return { statusCode: 200, message: 'Bank creado con éxito', data: newBank.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.getBankByFilters = async (filters) => {
    try {
        fetch_filters = [];
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined) {
                    fetch_filters.push([key, 'ilike', value]);
                }
            }
        }
        const response = await odooService.query('res.bank', 'search_read', { domain: fetch_filters, fields: ['id', 'name', 'bic', 'active'] });
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'Banks obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};


