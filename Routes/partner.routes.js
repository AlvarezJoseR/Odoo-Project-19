const express = require('express');
const router = express.Router();

//Controller
const partnerController = require('./../Controllers/partner.controller');

router.get('/', partnerController.getByFilters);
router.get('/:id', partnerController.getById);
router.post('/create', partnerController.create);
router.put('/update/:id', partnerController.update);
router.delete('/delete/:id', partnerController.delete);

module.exports = router;