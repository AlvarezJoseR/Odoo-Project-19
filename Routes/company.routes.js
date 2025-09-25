const express = require('express');
const router = express.Router();
const companyController = require('../Controllers/company.controller');


router.get('/:id', companyController.getById);

module.exports = router;
