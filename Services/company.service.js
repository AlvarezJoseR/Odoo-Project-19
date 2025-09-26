/**
 * Obtiene compañías filtradas por los parámetros dados.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Compañía' }).
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
const odooService = require('../Odoo/odoo.connection');

/**
 * Obtiene una compañía por su ID.
 * @param {number|string} id - ID de la compañía a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Obtiene una compañía específica de Odoo por su ID. Busca un registro en el modelo 'res.company' usando el ID proporcionado. Si la compañía existe, retorna su información básica (id, name, partner_id, currency_id).
 * @param {number|string} id - ID de la compañía a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la búsqueda, mensaje y datos de la compañía encontrada o null si no existe.
 */
exports.getById = async (id) => {
/**
 * Obtiene una lista de compañías filtradas según los parámetros dados. Realiza una búsqueda en el modelo 'res.company' usando los filtros proporcionados (por nombre, etc). Devuelve todas las compañías que coincidan con los criterios.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Compañía' }).
 * @returns {Promise<{statusCode: number, message: string, data: object[]}>} Objeto con el resultado de la búsqueda, mensaje y arreglo de compañías encontradas.
 */
    try {
        const companyId = Number(id);
        if (isNaN(companyId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        const company = await odooService.query('res.company', 'search_read', { domain: [['id', '=', companyId]], fields: ['id', 'name', 'partner_id', 'currency_id'] });

        if (company.error) return { statusCode: company.status, message: company.message, data: company.data };
        if (!company.success) return { statusCode: 400, message: company.message, data: company.data?.data?.message };
        if (!company.data || company.data.length === 0) return { statusCode: 404, message: `No se encontró ninguna company con id ${companyId}`, data: [] };
        return { statusCode: 200, message: 'Company obtenida con éxito', data: company.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
