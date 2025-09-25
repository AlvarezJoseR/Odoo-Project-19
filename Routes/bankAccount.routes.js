const express = require('express');
const router = express.Router();
const bankAccountController = require('../Controllers/bankAccount.controller');


router.get('/:id', bankAccountController.getById);

module.exports = router;
