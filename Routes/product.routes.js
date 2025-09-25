const express = require('express');
const router = express.Router();

//Controller
const productController = require('../Controllers/product.controller');

//Middlewares
const validateBody = require('./../Middleware/ValidateBody.middleware');
const { createProductSchema, updateProductSchema } = require('../Schemas/Product/product.schema');

router.get('/:id', productController.getById);
router.post('/', validateBody(createProductSchema), productController.create);
router.get('/', productController.getByFilters);
router.delete('/:id', productController.delete);
router.put('/:id', validateBody(updateProductSchema), productController.update);

module.exports = router;
