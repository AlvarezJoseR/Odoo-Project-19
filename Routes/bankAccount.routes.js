const express = require('express');
const router = express.Router();
const bankAccountController = require('../Controllers/bankAccount.controller');

//middlewares
const validateBody = require('./../Middleware/ValidateBody.middleware');
const { createBankAccountSchema } = require('../Schemas/BankAccount/bankAccount.schema');

router.get('/:id', bankAccountController.getById);
router.post('/', validateBody(createBankAccountSchema), bankAccountController.create);
router.delete('/:id', bankAccountController.delete);
router.get('/', bankAccountController.getByFilters);
module.exports = router;
