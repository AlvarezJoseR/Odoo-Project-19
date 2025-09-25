const attachmentService = require('../Services/attachment.service');

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await attachmentService.getById(id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.create = async (req, res) => {
    try {
        const file = req.file;
        const model = req.body.model;
        const { id } = req.params;
        const result = await attachmentService.createAttachment(model,id, file);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await attachmentService.delete(id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
