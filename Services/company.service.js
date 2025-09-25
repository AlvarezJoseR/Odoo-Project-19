const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const companyId = Number(id);
        if (isNaN(companyId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const company = await odooService.query("object", "execute_kw", ['res.company', 'search_read', [[['id', '=', companyId]]], {fields: ['id', 'name', 'partner_id', 'currency_id']}] );

        if (company.error) return { statusCode: 500, message: company.message, data: company };
        if (!company.success) return { statusCode: 400, message: company.message, data: company.data?.data?.message };
        if (!company.data || company.data.length === 0) return { statusCode: 404, message: `No se encontró ninguna company con id ${companyId}`, data: null };
        return { statusCode: 200, message: 'Company obtenida con éxito', data: company.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
