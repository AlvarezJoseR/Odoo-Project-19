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
