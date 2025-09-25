const Joi = require('joi');

const createBankAccountSchema = Joi.object({
    bank_id: Joi.number().positive().optional(),
    bank_name: Joi.string().optional(),
    partner_id: Joi.number().positive().optional(),
    acc_number: Joi.string().required(),
}).xor('bank_id', 'bank_name');

module.exports = { createBankAccountSchema };
    