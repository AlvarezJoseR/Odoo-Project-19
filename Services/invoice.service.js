const e = require('express');
const odooService = require('../Odoo/odoo.connection');

/**
 * Obtiene una factura por su ID.
 * @param {number|string} id - ID de la factura a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Obtiene una factura específica de Odoo por su ID. Busca un registro en el modelo 'account.move' usando el ID proporcionado. Si la factura existe, retorna su información básica (id, name, move_type, partner_id, amount_total, line_ids).
 * @param {number|string} id - ID de la factura a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la búsqueda, mensaje y datos de la factura encontrada o null si no existe.
 */
exports.getById = async (id) => {
    try {
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        const invoice = await odooService.query('account.move', 'search_read', { domain: [['id', '=', invoiceId]], fields: ['id', 'name', 'move_type', 'partner_id', 'amount_total', 'line_ids', 'currency_id', 'company_id', 'amount_residual'] });

        if (invoice.error) return { statusCode: invoice.status, message: invoice.message, data: invoice.data };
        if (!invoice.success) return { statusCode: 400, message: invoice.message, data: invoice.data?.data?.message };
        if (!invoice.data || invoice.data.length === 0) return { statusCode: 404, message: `No se encontró ningún invoice con id ${invoiceId}`, data: [] };
        return { statusCode: 200, message: 'Invoice obtenido con éxito', data: invoice.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Crea una nueva factura en Odoo.
 * @param {Object} invoiceInfo - Información de la factura a crear.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Crea una nueva factura en Odoo. Inserta un nuevo registro en el modelo 'account.move' con los datos proporcionados en invoiceInfo. Si se proveen productos, los agrega a la factura. Tras la creación, retorna la factura recién creada consultando por su ID.
 * @param {Object} invoiceInfo - Información de la factura a crear (por ejemplo: { partner_id, amount_total, products }).
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos de la factura creada.
 */
exports.create = async (invoiceInfo) => {
    try {
        invoiceInfo.invoice_date = new Date();
        //Prepare invoice data
        const invoice_data = {};
        for (const [key, value] of Object.entries(invoiceInfo)) {
            if (key != 'products') {
                invoice_data[key] = value;
            }
        }
        //Crear el invoice
        const newInvoice = await odooService.query('account.move', 'create', { vals_list: [invoice_data] });
        if (newInvoice.error) return { statusCode: newInvoice.status, message: newInvoice.message, data: newInvoice.data };
        if (!newInvoice.success) return { statusCode: 400, message: newInvoice.message, data: newInvoice.data?.data?.message };

        //Si trae productos, agregarlos
        if (invoiceInfo.hasOwnProperty('products')) {
            for (const product of invoiceInfo.products) {
                if (!product.hasOwnProperty('move_id')) product.move_id = newInvoice.data[0];
                //Agregar el producto
                await odooService.query('account.move.line', 'create', { vals_list: [product] });
            }
        }

        //Regresar la información del invoice creado
        const response = await this.getById(newInvoice.data);
        if (response.statusCode !== 200) return response;
        return { statusCode: 200, message: 'Invoice creado con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Agrega productos a una factura existente.
 * @param {number|string} id - ID de la factura.
 * @param {Array<Object>} products - Productos a agregar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Agrega productos a una factura existente en Odoo. Inserta nuevos registros en 'account.move.line' asociados a la factura indicada por ID.
 * @param {number|string} id - ID de la factura.
 * @param {Array<Object>} products - Productos a agregar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos de la factura actualizada.
 */
exports.addProduct = async (id, products) => {
    try {
        //Validar el id
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Verificar que el invoice exista
        const invoice = await this.getById(invoiceId);
        if (invoice.statusCode !== 200) return invoice;

        //Agregar los productos
        for (const product of products.products) {
            if (!product.hasOwnProperty('move_id')) product.move_id = invoiceId;
            await odooService.query('account.move.line', 'create', { vals_list: [product] });
        }

        //Regresar la información del invoice actualizado
        const response = await this.getById(invoiceId);
        if (response.statusCode !== 200) return response;
        return { statusCode: 200, message: 'Productos agregados con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Elimina productos de una factura existente.
 * @param {number|string} id - ID de la factura.
 * @param {Array<Object>} products - Productos a eliminar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Elimina productos de una factura existente en Odoo. Elimina registros en 'account.move.line' asociados a la factura indicada por ID.
 * @param {number|string} id - ID de la factura.
 * @param {Array<Object>} products - Productos a eliminar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos de la factura actualizada.
 */
exports.deleteProduct = async (id, products) => {
    try {
        //Validar el id
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Verificar que el invoice exista
        const invoice = await this.getById(invoiceId);
        if (invoice.statusCode !== 200) return invoice;

        //Eliminar los productos
        for (const productId of products.products) {

            const product = await odooService.query('account.move.line', 'unlink', { ids: [productId] });
            if (product.error) return { statusCode: product.status, message: product.message, data: product.data };
            if (!product.success) return { statusCode: 400, message: product.message, data: product.data?.data?.message };
        }

        //Regresar la información del invoice actualizado
        const response = await this.getById(invoiceId);
        if (response.statusCode !== 200) return response;
        return { statusCode: 200, message: 'Productos eliminados con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.confirmInvoice = async (id) => {
    try {
        //Validar el id
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Verificar que el invoice exista
        const invoice = await this.getById(invoiceId);
        if (invoice.statusCode !== 200) return invoice;

        //Confirmar el invoice
        const confirm = await odooService.query('account.move', 'action_post', { ids: [invoiceId] });
        if (confirm.error) return { statusCode: confirm.status, message: confirm.message, data: confirm.data };
        if (!confirm.success) return { statusCode: 400, message: confirm.message, data: confirm.data?.data?.message };

        //Regresar la información del invoice confirmado
        const response = await this.getById(invoiceId);
        if (response.statusCode !== 200) return response;
        return { statusCode: 200, message: 'Invoice confirmado con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.draftInvoice = async (id) => {
    try {
        //Validar el id
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        //Verificar que el invoice exista
        const invoice = await this.getById(invoiceId);
        if (invoice.statusCode !== 200) return invoice;

        //Cambiar el estado a borrador
        const draft = await odooService.query('account.move', 'button_draft', { ids: [invoiceId] });
        if (draft.error) return { statusCode: draft.status, message: draft.message, data: draft.data };
        if (!draft.success) return { statusCode: 400, message: draft.message, data: draft.data?.data?.message };

        //Regresar la información del invoice en estado borrador
        const response = await this.getById(invoiceId);
        if (response.statusCode !== 200) return response;
        return { statusCode: 200, message: 'Invoice cambiado a borrador con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.payInvoice = async (id, data) => {
    try {
        // Validar el id
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        // Verificar que la factura exista
        const invoice = await this.getById(invoiceId);
        if (invoice.statusCode !== 200) return invoice;
        const residual = invoice.data.amount_residual;
        const paymentAmount = data.amount;
        if (paymentAmount > residual) {
            data.amount = residual; 
        }
        //Crear el wizard con contexto
        const wizardCreate = await odooService.query(
            'account.payment.register',
            'create',
            {
                vals_list: data,
                context: {
                    active_model: 'account.move',
                    active_ids: [invoiceId]
                }
            }
        );

        if (!wizardCreate.success)
            return { statusCode: 400, message: wizardCreate.message, data: wizardCreate.data };

        const wizardId = wizardCreate.data[0];

        // 3️⃣ Confirmar el pago
        const payment = await odooService.query(
            'account.payment.register',
            'action_create_payments',
            { ids: [wizardId] }
        );
        // 4️⃣ Regresar la información actualizada de la factura
        const updatedInvoice = await this.getById(invoiceId);
        if (updatedInvoice.statusCode !== 200) return updatedInvoice;

        return { statusCode: 200, message: 'Invoice pagado con éxito', data: updatedInvoice.data };

    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

