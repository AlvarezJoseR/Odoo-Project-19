const express = require('express');
const router = express.Router();

//Controller
const utilController = require('./../Controllers/util.controller');


//Auth Routes
router.get('/getModel', utilController.getModel);

module.exports = router;