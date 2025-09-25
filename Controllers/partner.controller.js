const partnerService = require('../Services/partner.service');

// Métodos del controller de partner
exports.getByFilters = (req, res) => {
	try {
        // Lógica para obtener partners por filtros
        res.status(501).json({ message: 'No implementado: getByFilters' });
    } catch (e) {       
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.getById = async (req, res) => {
	try {
        const { id } = req.params;
        const response = await partnerService.getById(id);
        res.status(response.statusCode).json(response);
    } catch (e) {
        console.error(e);
        res.status(500).json({ statusCode: 500,message: 'Error interno del servidor', data: e.message });
    }
};

exports.create = (req, res) => {
	try {
        // Lógica para crear un partner
        res.status(501).json({ message: 'No implementado: create' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.update = (req, res) => {
	try {
        // Lógica para actualizar un partner
        res.status(501).json({ message: 'No implementado: update' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.delete = (req, res) => {
	try {
        // Lógica para eliminar un partner
        res.status(501).json({ message: 'No implementado: delete' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

