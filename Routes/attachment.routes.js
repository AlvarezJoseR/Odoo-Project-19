const express = require('express');
const router = express.Router();
const attachmentController = require('../Controllers/attachment.controller');

//Multer config
const multer  = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage })

router.get('/:id', attachmentController.getById);
router.post('/:id', upload.single('file'), attachmentController.create);
router.delete('/:id', attachmentController.delete);
module.exports = router;
