const express = require('express');
const router = express.Router();
const bankController = require('../Controllers/bank.controller');


router.get('/getById/:id', bankController.getById);

module.exports = router;
