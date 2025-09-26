const odooService = require('../Odoo/odoo.connection');
const companyService = require('./company.service');
const bankAccountService = require('./bankAccount.service');
// Importar el esquema de validación
const { createPartnerSchema } = require('../Schemas/Partner/partner.schema');
// Métodos del service de partner

const partnerFields = [
    "id",
    "company_id",
    "name",
    "is_company",
    "street",
    "street2",
    "city",
    "state_id",
    "country_id",
    "phone",
    "lang",
    "customer_rank",
    "supplier_rank",
    "l10n_latam_identification_type_id",
    "vat"
];

/**
 * Obtiene una lista de partners filtrados según los parámetros dados. Realiza una búsqueda en el modelo 'res.partner' usando los filtros proporcionados (por nombre, email, etc). Devuelve todos los partners que coincidan con los criterios.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Juan' }).
 * @returns {Promise<{statusCode: number, message: string, data: object[]}>} Objeto con el resultado de la búsqueda, mensaje y arreglo de partners encontrados.
 */
exports.getByFilters = async (filters) => {
    try {
        fetch_filters = [];
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined) {
                    fetch_filters.push([key, 'ilike', value]);
                }
            }
        }

        const response = await odooService.query('res.partner', 'search_read', { domain: fetch_filters, fields: partnerFields });
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'Partners obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }

};

/**
 * Obtiene un partner específico de Odoo por su ID. Busca un registro en el modelo 'res.partner' usando el ID proporcionado. Si el partner existe, retorna su información básica (id, name, email, phone).
 * @param {number|string} id - ID del partner a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la búsqueda, mensaje y datos del partner encontrado o null si no existe.
 */
exports.getById = async (id) => {
    try {
        //validar que el id sea un número
        const partnerId = Number(id);
        if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Obtenemos el partner
        const partner = await odooService.query('res.partner', 'search_read', { domain: [['id', '=', partnerId]], fields: partnerFields });

        if (partner.error) return { statusCode: partner.status, message: partner.message, data: partner.data };
        if (!partner.success) return { statusCode: 400, message: partner.message, data: partner.data.data.message };
        if (partner.data.length === 0) return { statusCode: 404, message: `No se encontró ningún partner con id ${partnerId}`, data: [] };

        //Regresar el partner
        return { statusCode: 200, message: 'Partner obtenido con éxito', data: partner.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Crea un nuevo partner en Odoo. Inserta un nuevo registro en el modelo 'res.partner' con los datos proporcionados en partnerInfo. Si la compañía no existe, retorna error. Permite crear cuentas bancarias asociadas si se proveen.
 * @param {Object} partnerInfo - Información del partner a crear (por ejemplo: { name, email, company_id }).
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos del partner creado.
 */
exports.create = async (partnerInfo) => {
    try {
        const partnerFields = createPartnerSchema.describe().keys;
        const partnerData = {};

        console.log(partnerInfo);
        //Verificar la identificación
        if (partnerInfo.hasOwnProperty('identificacion_type')) {
            partnerInfo.l10n_latam_identification_type_id = partnerInfo.identificacion_type;
            delete partnerInfo.identificacion_type;
        }
        console.log(partnerInfo);
        //Verificar si la compañía ya existe
        const company = await companyService.getById(partnerInfo.company_id);
        if (company.statusCode !== 200) return company;

        //Extraer solo los campos de partner permitidos
        for (const [key, value] of Object.entries(partnerInfo)) {
            if (partnerFields.hasOwnProperty(key) && key != 'bank_account') {
                partnerData[key] = value;
            }
        }


        //Crear el partner
        console.log('Creando partner:', partnerData);
        const createResponse = await odooService.query('res.partner', 'create', { vals_list: [partnerData] });
        if (createResponse.error) return { statusCode: createResponse.status, message: createResponse.message, data: createResponse.data };
        if (!createResponse.success) return { statusCode: 400, message: createResponse.message, data: createResponse.data?.data?.message };

        //Crear cuenta bancaria si se proporciona
        if (partnerInfo.hasOwnProperty('bank_account')) {
            for (const bank_account of partnerInfo.bank_account) {
                bank_account.partner_id = createResponse.data;

                await bankAccountService.create(bank_account);

            }
        }
        //Regresar la información del partner creado
        const response = await this.getById(createResponse.data);
        if (response.statusCode !== 200) return response;

        return { statusCode: 200, message: 'Partner creado con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.update = async (id, partnerInfo) => {
    try {
        //validar que el id sea un número
        const partnerId = Number(id);
        if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Validar que el partner exista
        const partnerExists = await this.getById(partnerId);
        if (partnerExists.statusCode !== 200) return partnerExists;

        //Actualizar el partner
        const updateResponse = await odooService.query('res.partner', 'write', { ids: [partnerId], vals: partnerInfo });
        if (updateResponse.error) return { statusCode: updateResponse.status, message: updateResponse.message, data: updateResponse.data };
        if (!updateResponse.success) return { statusCode: 400, message: updateResponse.message, data: updateResponse.data?.data?.message };

        //Regresar la información del partner actualizado
        const response = await this.getById(partnerId);
        if (response.statusCode !== 200) return response;
        return { statusCode: 200, message: 'Partner actualizado con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.delete = async (id) => {
    try {
        //validar que el id sea un número
        const partnerId = Number(id);
        if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Validar que el partner exista
        const partnerExists = await this.getById(partnerId);
        if (partnerExists.statusCode !== 200) return partnerExists;

        //Eliminar el partner
        const response = await odooService.query('res.partner', 'unlink', { ids: [partnerId] });
        if (response.error) return { statusCode: response.status, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data.data.message };

        return { statusCode: 200, message: 'Partner eliminado con éxito', data: [] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
