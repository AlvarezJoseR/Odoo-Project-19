const odooService = require('../Odoo/odoo.connection');

/**
 * Obtiene un banco específico de Odoo por su ID. Busca un registro en el modelo 'res.bank' usando el ID proporcionado. Si el banco existe, retorna su información básica (id, name, bic, active).
 * @param {number|string} id - ID del banco a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la búsqueda, mensaje y datos del banco encontrado o null si no existe.
 */
exports.getById = async (id) => {
    try {
        // Validar que el id es un número
        const bankId = Number(id);
        if (isNaN(bankId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: []};

        // Obtener el bank
        const bank = await odooService.query('res.bank', 'search_read', { domain: [['id', '=', bankId]] }, { fields: ['id', 'name', 'bic', 'active'] });
        if (bank.error) return { statusCode: bank.status, message: bank.message, data: bank.data };
        if (!bank.success) return { statusCode: 400, message: bank.message, data: bank.data?.data?.message };
        if (!bank.data || bank.data.length === 0) return { statusCode: 404, message: `No se encontró ningún bank con id ${bankId}`, data: [] };
        
        // Regresar el bank
        return { statusCode: 200, message: 'Bank obtenido con éxito', data: bank.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Crea un nuevo banco en Odoo. Inserta un nuevo registro en el modelo 'res.bank' con los datos proporcionados en bankInfo. Tras la creación, retorna el banco recién creado consultando por su ID.
 * @param {Object} bankInfo - Información del banco a crear (por ejemplo: { name, bic, active }).
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos del banco creado.
 */
exports.create = async (bankInfo) => {
    try {
        //Crear el bank
        const newBank = await odooService.query('res.bank', 'create', { vals_list: [bankInfo] });
        if (newBank.error) return { statusCode: newBank.status, message: newBank.message, data: newBank.data };
        if (!newBank.success) return { statusCode: 400, message: newBank.message, data: newBank.data?.data?.message };

        // Regresar el bank creado
        const bank = await this.getById(newBank.data);
        if (bank.statusCode !== 200) return bank;

        return { statusCode: 200, message: 'Bank creado con éxito', data: bank.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Obtiene una lista de bancos filtrados según los parámetros dados. Realiza una búsqueda en el modelo 'res.bank' usando los filtros proporcionados (por nombre, BIC, etc). Devuelve todos los bancos que coincidan con los criterios.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Banco' }).
 * @returns {Promise<{statusCode: number, message: string, data: object[]}>} Objeto con el resultado de la búsqueda, mensaje y arreglo de bancos encontrados.
 */
exports.getBankByFilters = async (filters) => {
    try {
        //Crear los filtros
        let fetch_filters = [];
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined) {
                    fetch_filters.push([key, 'ilike', value]);
                }
            }
        }

        //Obtener los banks
        const response = await odooService.query('res.bank', 'search_read', { domain: fetch_filters, fields: ['id', 'name', 'bic', 'active'] });
        if (response.error) return { statusCode: response.status, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'Banks obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};


