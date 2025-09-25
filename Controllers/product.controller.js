const productService = require('../Services/product.service');

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productService.getById(id || req.params.id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.create = async (req, res) => {
    try {
        const productInfo = req.body;
        const result = await productService.create(productInfo);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.getByFilters = async (req, res) => {
    try {
        const filters = req.query; 
        const result = await productService.getByFilters(filters);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productService.delete(id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const productInfo = req.body;
        const result = await productService.update(id, productInfo);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
