const odooService = require('../Odoo/odoo.connection');
const companyService = require('./company.service');
// Importar el esquema de validación
const { createPartnerSchema } = require('../Schemas/Partner/partner.schema');
// Métodos del service de partner


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

        const response = await odooService.query('res.partner', 'search_read', { domain: fetch_filters, fields: ['id', 'name', 'email', 'phone'] });
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'Partners obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }

};

exports.getById = async (id) => {
    try {
        //validar que el id sea un número
        const partnerId = Number(id);
        if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        //Obtenemos el partner
        const partner = await odooService.query('res.partner', 'search_read', { domain: [['id', '=', partnerId]], fields: ['id', 'name', 'email', 'phone'] });

        if (partner.error) return { statusCode: 500, message: partner.message, data: partner };
        if (!partner.success) return { statusCode: 400, message: partner.message, data: partner.data.data.message };
        if (partner.data.length === 0) return { statusCode: 404, message: `No se encontró ningún partner con id ${partnerId}`, data: [] };

        //Regresar el partner
        return { statusCode: 200, message: 'Partner obtenido con éxito', data: partner.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.create = async (partnerInfo) => {
    try {
        const partnerFields = createPartnerSchema.describe().keys;
        const partnerData = {};

        //Verificar si la compañía ya existe
        const company = await companyService.getById(partnerInfo.company_id);
        if (company.statusCode !== 200) return company;

        //Extraer solo los campos de partner permitidos
        for (const [key, value] of Object.entries(partnerInfo)) {
            if (partnerFields.hasOwnProperty(key) && key != 'bank_account') {
                partnerData[key] = value;
            }
        }

        //Crear cuenta bancaria si se proporciona
        if (partnerInfo.hasOwnProperty('bank_account')) {
            for (const bank_account of partnerInfo.bank_account) {
                bank_account.partner_id = response.data;

                await bankAccountService.createBankAccount(credentials, bank_account);

            }
        }
        //Crear el partner
        const createResponse = await odooService.query('res.partner', 'create', { vals_list: [partnerData] });
        if (createResponse.error) return { statusCode: 500, message: createResponse.message, data: createResponse };
        if (!createResponse.success) return { statusCode: 400, message: createResponse.message, data: createResponse.data?.data?.message };

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
        if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        //Validar que el partner exista
        const partnerExists = await this.getById(partnerId);
        if (partnerExists.statusCode !== 200) return partnerExists;

        //Actualizar el partner
        const updateResponse = await odooService.query('res.partner', 'write', { ids: [partnerId], vals: partnerInfo });
        if (updateResponse.error) return { statusCode: 500, message: updateResponse.message, data: updateResponse };
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
        if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        //Validar que el partner exista
        const partnerExists = await this.getById(partnerId);
        if (partnerExists.statusCode !== 200) return partnerExists;

        //Eliminar el partner
        const response = await odooService.query('res.partner', 'unlink', { ids: [partnerId] });
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data.data.message };

        return { statusCode: 200, message: 'Partner eliminado con éxito', data: [] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
