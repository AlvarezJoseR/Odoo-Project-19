const bankAccountService = require('../Services/bankAccount.service');

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bankAccountService.getById(id || req.params.id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.getByFilters = async (req, res) => {
    try {
        const filters = req.query;
        const result = await bankAccountService.getByFilters(filters);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.create = async (req, res) => {
    try {
        const bankAccountInfo = req.body;
        const result = await bankAccountService.create(bankAccountInfo);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


exports.delete = async (req, res) => {
    try {
        const { id } = req.params; 
        const result = await bankAccountService.delete(id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }   
}; 