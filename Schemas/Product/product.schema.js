const Joi = require('joi')

const createProductSchema = Joi.object({
    name: Joi.string().optional(),
    list_price: Joi.number().positive().required(),
    sale_ok: Joi.boolean().optional(),
    purchase_ok: Joi.boolean().optional(),
    standard_price: Joi.number().positive(),
    type: Joi.string().valid('consu', 'service', 'combo').optional().default('consu'),
    invoice_policy: Joi.string().valid('order', 'delivery').optional().default('order'),
});


// Ejemplo de esquema para actualizar un producto
const updateProductSchema = Joi.object({
    name: Joi.string().optional(),
    list_price: Joi.number().positive().optional(),
    sale_ok: Joi.boolean().optional(),
    purchase_ok: Joi.boolean().optional(),
    standard_price: Joi.number().positive().optional(),
    type: Joi.string().valid('consu', 'service', 'combo').optional().default('consu'),
    invoice_policy: Joi.string().valid('order', 'delivery').optional().default('order'),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
};