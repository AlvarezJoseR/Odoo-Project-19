const e = require('express');
const odooService = require('../Odoo/odoo.connection');

exports.getById = async (id) => {
    try {
        // Validar que el id sea un número
        const productId = Number(id);
        if (isNaN(productId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        // Obtenemos el producto
        const product = await odooService.query('product.template', 'search_read', {domain: [['id', '=', productId]], fields: ['id', 'name', 'default_code', 'list_price']});
        if (product.error) return { statusCode: 500, message: product.message, data: product };
        if (!product.success) return { statusCode: 400, message: product.message, data: product.data?.data?.message };
        if (!product.data || product.data.length === 0) return { statusCode: 404, message: `No se encontró ningún producto con id ${productId}`, data: [] };
        return { statusCode: 200, message: 'Producto obtenido con éxito', data: product.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.create = async (productInfo) => {
    try {
        const newProduct = await odooService.query('product.template', 'create', { vals_list: [productInfo] });
        if (newProduct.error) return { statusCode: 500, message: newProduct.message, data: newProduct };
        if (!newProduct.success) return { statusCode: 400, message: newProduct.message, data: newProduct.data?.data?.message };
        const response = await this.getById(newProduct.data);
        if (response.statusCode !== 200) return response;

        return { statusCode: 200, message: 'Producto creado con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
}

exports.getByFilters = async (filters) => {
    try {
        fetch_filters = []; 
       for (const [key, value] of Object.entries(filters)) {
           fetch_filters.push([key, 'ilike', value]);
       }
         const response = await odooService.query('product.template', 'search_read', { domain: fetch_filters, fields: ['id', 'name', 'default_code', 'list_price'] });
        if (response.error) return { statusCode: 500, message: response.message, data: response };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'Productos obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.delete = async (id) => {
    try {
        // Validar que el id sea un número
        const productId = Number(id);
        if (isNaN(productId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };
        
        //Verificar que el producto existe
        const product = await this.getById(productId);
        if (product.statusCode !== 200) return product;

        //Eliminar el producto
        const deleteResponse = await odooService.query('product.template', 'unlink', { ids: [productId] });
        if (deleteResponse.error) return { statusCode: 500, message: deleteResponse.message, data: deleteResponse };
        if (!deleteResponse.success) return { statusCode: 400, message: deleteResponse.message, data: deleteResponse.data?.data?.message };
        if (!deleteResponse.data || deleteResponse.data.length === 0) return { statusCode: 404, message: `No se encontró ningún producto con id ${productId}`, data: [] };
        
        //Regresar respuesta
        return { statusCode: 200, message: 'Producto eliminado con éxito', data: [] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

exports.update = async (id, productInfo) => {
    try {
        // Validar que el id sea un número
        const productId = Number(id);
        if (isNaN(productId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };
        
        //Verificar que el producto existe
        const product = await this.getById(productId);
        if (product.statusCode !== 200) return product;
        
        //Actualizar el producto
        const updateResponse = await odooService.query('product.template', 'write', { ids: [productId], vals: productInfo });
        if (updateResponse.error) return { statusCode: 500, message: updateResponse.message, data: updateResponse };
        if (!updateResponse.success) return { statusCode: 400, message: updateResponse.message, data: updateResponse.data?.data?.message };

        //Obtener el producto actualizado
        const updatedProduct = await this.getById(productId);
        if (updatedProduct.statusCode !== 200) return updatedProduct;
        return { statusCode: 200, message: 'Producto actualizado con éxito', data: updatedProduct.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};