const express = require('express');
const router = express.Router();
const invoiceController = require('../Controllers/invoice.controller');

//Middlewares
const validateBody = require('./../Middleware/ValidateBody.middleware');
const { createInvoicesSchema, addProductSchema, deleteProductsInvoiceSchema  } = require('../Schemas/Invoice/invoice.schema');

//

router.get('/:id', invoiceController.getById);
router.post('/', validateBody(createInvoicesSchema), invoiceController.create);
router.put('/addproduct/:id', validateBody(addProductSchema), invoiceController.addProduct);
router.delete('/deleteproduct/:id', validateBody(deleteProductsInvoiceSchema), invoiceController.deleteProduct);
router.post('/confirm/:id', invoiceController.confirmInvoice);
router.post('/draft/:id', invoiceController.draftInvoice);
router.post('/pay/:id', invoiceController.payInvoice);
module.exports = router;
