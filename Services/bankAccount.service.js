const odooService = require('../Odoo/odoo.connection');
const partnerService = require('./partner.service');
const bankService = require('./bank.service');
exports.getById = async (id) => {
    try {
        const bankAccountId = Number(id);
        if (isNaN(bankAccountId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

        const bankAccount = await odooService.query('res.partner.bank', 'search_read', { domain: [['id', '=', bankAccountId]], fields: ['id', 'acc_number', 'bank_name', 'partner_id', 'bank_id'] });

        if (bankAccount.error) return { statusCode: 500, message: bankAccount.message, data: bankAccount };
        if (!bankAccount.success) return { statusCode: 400, message: bankAccount.message, data: bankAccount.data?.data?.message };
        if (!bankAccount.data || bankAccount.data.length === 0) return { statusCode: 404, message: `No se encontró ningún bankAccount con id ${bankAccountId}`, data: [] };
        return { statusCode: 200, message: 'BankAccount obtenido con éxito', data: bankAccount.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

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
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'BankAccounts obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

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
            if (isNaN(id)) return { statusCode: 400, message: `El id '${bankAccountInfo.bank_id}' no es válido. Debe ser un número.`, data: null };
            bank_account_data.bank_id = id;

            //Verificar que el bank_id existe
            const bank = await bankService.getById(bank_account_data.bank_id);
            if (bank.statusCode !== 200) return bank;
        } else {
            //Buscar banco por nombre o crear nuevo
             console.log(bankAccountInfo.bank_name, 'bankAccountInfo1');
            const bank = await bankService.getBankByFilters({ name: bankAccountInfo.bank_name });
            if (bank.data && bank.data.length === 1) {
                bank_account_data.bank_id = bank.data[0].id;
            } else {
                //create new bank and use id
                const new_bank_id = await bankService.create({ "name": bankAccountInfo.bank_name });
                if (new_bank_id.statusCode != 200) console.error(new_bank_id.data);
                console.log(new_bank_id, 'new_bank_id');
                bank_account_data.bank_id = new_bank_id.data[0];
            }
        }

        //verificar que no existe una cuenta bancaria con el mismo número para el mismo partner
        const existing_bank_account = await odooService.query('res.partner.bank', 'search_read', { domain: [['acc_number', '=', bank_account_data.acc_number], ['bank_id', '=', bank_account_data.bank_id]], fields: ['id'] });
        if (existing_bank_account.error) return { statusCode: 500, message: existing_bank_account.message, data: existing_bank_account };
        if (!existing_bank_account.success) return { statusCode: 400, message: existing_bank_account.message, data: existing_bank_account.data?.data?.message };
        if (existing_bank_account.data && existing_bank_account.data.length > 0) return { statusCode: 400, message: `Ya existe una cuenta bancaria con el número '${bank_account_data.acc_number}' para el partner con id '${bank_account_data.partner_id}'`, data: [] };

        //Crear la cuenta bancaria
        const response = await odooService.query("res.partner.bank", "create", {vals_list: [bank_account_data]});
        if (response.success === false && response.error === true) return { statusCode: 500, message: "Error interno.", data: [response.data.message] };
        if (response.success === false) return { statusCode: 400, message: "Error creando la cuenta bancaria.", data: [response.data.data.message] };
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
        if (isNaN(bankAccountId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };
        
        //Validar que la cuenta bancaria exista
        const bankAccountExists = await this.getById(bankAccountId);
        if (bankAccountExists.statusCode !== 200) return bankAccountExists;

        //Eliminar la cuenta bancaria
        const response = await odooService.query("res.partner.bank", "unlink", { ids: [bankAccountId] });
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };

        //Regresar la cuenta bancaria eliminada
        return { statusCode: 200, message: 'Cuenta bancaria eliminada con éxito', data: [] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
