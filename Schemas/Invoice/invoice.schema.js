const Joi = require('joi')
const addProductInvoiceSchema = Joi.object({
    move_id: Joi.number().integer(),
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().optional(),
    price_unit: Joi.number().integer().optional()
});

const createInvoicesSchema = Joi.object({

    partner_id: Joi.number().integer().required(),
    invoice_date_due: Joi.date().optional(),
    invoice_payment_term_id: Joi.number().integer(),
    products: Joi.array().items(addProductInvoiceSchema).optional(),
    move_type: Joi.string().required()

}).xor("invoice_date_due", "invoice_payment_term_id");

const addProductSchema = Joi.object({

    products: Joi.array().items(Joi.object({

        price_unit: Joi.number().integer().optional(),
        quantity: Joi.number().integer().optional(),
        product_id: Joi.number().integer().required()
    })).required()
});

const deleteProductsInvoiceSchema = Joi.object({
    products: Joi.array().items(Joi.number().integer().positive()),
});


module.exports = {createInvoicesSchema, addProductInvoiceSchema, addProductSchema, deleteProductsInvoiceSchema};