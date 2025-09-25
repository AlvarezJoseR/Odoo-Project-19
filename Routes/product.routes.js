const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');


router.get('/:id', productController.getById);

module.exports = router;
