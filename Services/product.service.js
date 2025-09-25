const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        // Validar que el id sea un número
        const productId = Number(id);
        if (isNaN(productId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        // Obtenemos el producto
        const product = await odooService.query("object", "execute_kw", ['product.template', 'search_read', [[['id', '=', productId]]], {fields: ['id', 'name', 'default_code', 'list_price']}] );

        if (product.error) return { statusCode: 500, message: product.message, data: product };
        if (!product.success) return { statusCode: 400, message: product.message, data: product.data?.data?.message };
        if (!product.data || product.data.length === 0) return { statusCode: 404, message: `No se encontró ningún producto con id ${productId}`, data: [] };
        return { statusCode: 200, message: 'Producto obtenido con éxito', data: product.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};
