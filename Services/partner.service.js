const odooService = require('../Odoo/odoo.connection');    

// Métodos del service de partner
exports.getByFilters = async (filters) => {
	// Lógica para obtener partners por filtros
	throw new Error('No implementado: getByFilters');
};

exports.getById = async (id) => {
    try {
	//validar que el id sea un número
    const partnerId = Number(id);
    if (isNaN(partnerId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: null };

    //Obtenemos el partner
    const partner = await odooService.query("object", "execute_kw", ['res.partner', 'search_read', [[['id', '=', partnerId]]], {fields: ['id', 'name', 'email', 'phone']}]);

    if (partner.error) return { statusCode: 500, message: partner.message, data: partner };
    if (!partner.success) return { statusCode: 400, message: partner.message, data: partner.data.data.message };
    if (partner.data.length === 0) return { statusCode: 404, message: `No se encontró ningún partner con id ${partnerId}`, data: null };
    return { statusCode: 200, message: 'Partner obtenido con éxito', data: partner.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.create = async (data) => {
	// Lógica para crear un partner
	throw new Error('No implementado: create');
};

exports.update = async (id, data) => {
	// Lógica para actualizar un partner
	throw new Error('No implementado: update');
};

exports.delete = async (id) => {
	// Lógica para eliminar un partner
	throw new Error('No implementado: delete');
};
