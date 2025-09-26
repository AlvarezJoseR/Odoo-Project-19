const odooService = require('../Odoo/odoo.connection');
const partnerService = require('./partner.service');
const bankService = require('./bank.service');
/**
 * Obtiene una cuenta bancaria específica de Odoo por su ID. Busca un registro en el modelo 'res.partner.bank' usando el ID proporcionado. Si la cuenta existe, retorna su información básica (id, acc_number, bank_name, partner_id, bank_id).
 * @param {number|string} id - ID de la cuenta bancaria a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la búsqueda, mensaje y datos de la cuenta encontrada o null si no existe.
 */
exports.getById = async (id) => {
    try {
        const bankAccountId = Number(id);
        if (isNaN(bankAccountId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        const bankAccount = await odooService.query('res.partner.bank', 'search_read', { domain: [['id', '=', bankAccountId]], fields: ['id', 'acc_number', 'bank_name', 'partner_id', 'bank_id'] });

        if (bankAccount.error) return { statusCode: bankAccount.status, message: bankAccount.message, data: bankAccount.data };
        if (!bankAccount.success) return { statusCode: 400, message: bankAccount.message, data: bankAccount.data?.data?.message };
        if (!bankAccount.data || bankAccount.data.length === 0) return { statusCode: 404, message: `No se encontró ningún bankAccount con id ${bankAccountId}`, data: [] };
        return { statusCode: 200, message: 'BankAccount obtenido con éxito', data: bankAccount.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Obtiene una lista de cuentas bancarias filtradas según los parámetros dados. Realiza una búsqueda en el modelo 'res.partner.bank' usando los filtros proporcionados (por número, banco, etc). Devuelve todas las cuentas que coincidan con los criterios.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { acc_number: '123' }).
 * @returns {Promise<{statusCode: number, message: string, data: object[]}>} Objeto con el resultado de la búsqueda, mensaje y arreglo de cuentas encontradas.
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

        const response = await odooService.query('res.partner.bank', 'search_read', { domain: fetch_filters, fields: ['id', 'acc_number', 'bank_name', 'partner_id'] });
        if (response.error) return { statusCode: response.status, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'BankAccounts obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Crea una nueva cuenta bancaria en Odoo. Inserta un nuevo registro en el modelo 'res.partner.bank' con los datos proporcionados en bankAccountInfo. Si el banco no existe, lo crea automáticamente. Verifica que no exista una cuenta duplicada para el mismo partner y banco.
 * @param {Object} bankAccountInfo - Información de la cuenta bancaria a crear (por ejemplo: { acc_number, partner_id, bank_id }).
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos de la cuenta creada.
 */
exports.create = async (bankAccountInfo) => {
    try {
       
        const bank_account_data = { "acc_number": bankAccountInfo.acc_number, "partner_id": bankAccountInfo.partner_id, "bank_id": 0 };
        //Verificar que el partner existe
        const partner = await partnerService.getById(bankAccountInfo.partner_id);
        if (partner.statusCode !== 200) return partner

        //Si se envía bank_id usarlo, si no buscar por nombre o crear nuevo banco
        if (bankAccountInfo.bank_id) {

            //Verificar que el bank_id es válido
            const id = Number(bankAccountInfo.bank_id);
            if (isNaN(id)) return { statusCode: 400, message: `El id '${bankAccountInfo.bank_id}' no es válido. Debe ser un número.`, data: [] };
            bank_account_data.bank_id = id;

            //Verificar que el bank_id existe
            const bank = await bankService.getById(bank_account_data.bank_id);
            if (bank.statusCode !== 200) return bank;
        } else {
            //Buscar banco por nombre o crear nuevo
            const bank = await bankService.getBankByFilters({ name: bankAccountInfo.bank_name });
            if (bank.data && bank.data.length === 1) {
                bank_account_data.bank_id = bank.data[0].id;
            } else {
                //create new bank and use id
                const new_bank_id = await bankService.create({ "name": bankAccountInfo.bank_name });
                if (new_bank_id.statusCode != 200) console.error(new_bank_id.data);
                bank_account_data.bank_id = new_bank_id.data[0];
            }
        }

        //verificar que no existe una cuenta bancaria con el mismo número para el mismo partner
        const existing_bank_account = await odooService.query('res.partner.bank', 'search_read', { domain: [['acc_number', '=', bank_account_data.acc_number], ['bank_id', '=', bank_account_data.bank_id]], fields: ['id'] });
        if (existing_bank_account.error) return { statusCode: existing_bank_account.status, message: existing_bank_account.message, data: existing_bank_account.data };
        if (!existing_bank_account.success) return { statusCode: 400, message: existing_bank_account.message, data: existing_bank_account.data?.data?.message };
        if (existing_bank_account.data && existing_bank_account.data.length > 0) return { statusCode: 400, message: `Ya existe una cuenta bancaria con el número '${bank_account_data.acc_number}' para el partner con id '${bank_account_data.partner_id}'`, data: [] };

        //Crear la cuenta bancaria
        const response = await odooService.query("res.partner.bank", "create", {vals_list: [bank_account_data]});
        if (response.error) return { statusCode: response.status, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: "Error creando la cuenta bancaria.", data: [response.data.data.message] };
        const bankAccount = await this.getById(response.data)

        //Regresar la cuenta bancaria creada
        return { statusCode: 200, message: "Cuenta bancaria creada.", data: bankAccount.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.delete = async (id) => {
    try {
        //Validar que el id sea un número
        const bankAccountId = Number(id);
        if (isNaN(bankAccountId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };
        
        //Validar que la cuenta bancaria exista
        const bankAccountExists = await this.getById(bankAccountId);
        if (bankAccountExists.statusCode !== 200) return bankAccountExists;

        //Eliminar la cuenta bancaria
        const response = await odooService.query("res.partner.bank", "unlink", { ids: [bankAccountId] });
        if (response.error) return { statusCode: response.status, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };

        //Regresar la cuenta bancaria eliminada
        return { statusCode: 200, message: 'Cuenta bancaria eliminada con éxito', data: [] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
