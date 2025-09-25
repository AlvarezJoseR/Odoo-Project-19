const e = require('express');
const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        const invoiceId = Number(id);
        if (isNaN(invoiceId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        const invoice = await odooService.query('account.move', 'search_read', { domain: [['id', '=', invoiceId]], fields: ['id', 'name', 'move_type', 'partner_id', 'amount_total', 'line_ids'] });

        if (invoice.error) return { statusCode: 500, message: invoice.message, data: invoice };
        if (!invoice.success) return { statusCode: 400, message: invoice.message, data: invoice.data?.data?.message };
        if (!invoice.data || invoice.data.length === 0) return { statusCode: 404, message: `No se encontró ningún invoice con id ${invoiceId}`, data: [] };
        return { statusCode: 200, message: 'Invoice obtenido con éxito', data: invoice.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

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
        if (newInvoice.error) return { statusCode: 500, message: newInvoice.message, data: newInvoice };
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
            if (product.error) return { statusCode: 500, message: product.message, data: product.data };
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
