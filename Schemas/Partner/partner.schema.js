const Joi = require('joi')

const createPartnerSchema = Joi.object({
  company_id: Joi.number().required(),
  name: Joi.string().required(),
  is_company: Joi.boolean().required(),
  street: Joi.string().optional().allow(''),
  street2: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state_id: Joi.number().optional(),
  country_id: Joi.number().optional(),
  phone: Joi.string().optional().allow(''),
  lang: Joi.string().optional().allow(''),
  customer_rank: Joi.number().default(0),
  supplier_rank: Joi.number().default(0),
  identificacion_type: Joi.number().required(),
  vat: Joi.string().optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  bank_account: Joi.array().items().optional(),
  l10n_latam_identification_type_id: Joi.number().optional()  
})


// Ejemplo de esquema para actualizar un partner
const updatePartnerSchema = Joi.object({
  is_company: Joi.boolean(),
  company_id: Joi.number().integer().optional(),

  name: Joi.string(),

  street: Joi.string().optional().allow(''),
  street2: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state_id: Joi.number().integer().optional(),
  country_id: Joi.number().integer().optional(),
  zip: Joi.string().optional().allow(''),
  vat: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  mobile: Joi.string().optional().allow(''),
  customer_rank: Joi.number().integer().optional(),
  supplier_rank: Joi.number().integer().optional(),

  email: Joi.string().email().optional().allow(''),
  website: Joi.string().uri().optional().allow(''),

  lang: Joi.string().optional(),
});

module.exports = {
  createPartnerSchema,
  updatePartnerSchema,
};