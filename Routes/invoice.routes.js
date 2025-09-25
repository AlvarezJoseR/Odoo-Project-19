const express = require('express');
const router = express.Router();
const invoiceController = require('../Controllers/invoice.controller');


router.get('/:id', invoiceController.getById);

module.exports = router;
