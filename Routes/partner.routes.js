const express = require('express');
const router = express.Router();

//Controller
const partnerController = require('./../Controllers/partner.controller');

//Middlewares
const validateBody = require('./../Middleware/ValidateBody.middleware');
const { createPartnerSchema, updatePartnerSchema } = require('../Schemas/Partner/partner.schema');

router.get('/', partnerController.getByFilters);
router.get('/:id', partnerController.getById);
router.post('/', validateBody(createPartnerSchema), partnerController.create);
router.put('/:id', validateBody(updatePartnerSchema), partnerController.update);
router.delete('/:id', partnerController.delete);
router.post('/contact/:id', partnerController.addContact);

module.exports = router;