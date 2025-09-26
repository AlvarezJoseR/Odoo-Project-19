const e = require('express');
const odooService = require('../Odoo/odoo.connection');

const productFields = [
  "name",
  "list_price",
  "standard_price",
  "purchase_ok",
  "sale_ok",
  "type",
  "invoice_policy"
]

/**
 * Obtiene un producto por su ID.
 * @param {number|string} id - ID del producto a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Obtiene un producto específico de Odoo por su ID. Busca un registro en el modelo 'product.template' usando el ID proporcionado. Si el producto existe, retorna su información básica (id, name, default_code, list_price).
 * @param {number|string} id - ID del producto a buscar.
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la búsqueda, mensaje y datos del producto encontrado o null si no existe.
 */
exports.getById = async (id) => {
    try {
        // Validar que el id sea un número
        const productId = Number(id);
        if (isNaN(productId)) return { statusCode: 400, message: `El id '${id}' no es válido. Debe ser un número.`, data: [] };

        // Obtenemos el producto
        const product = await odooService.query('product.template', 'search_read', { domain: [['id', '=', productId]], fields: productFields });
        if (product.error) return { statusCode: product.status, message: product.message, data: product.data };
        if (!product.success) return { statusCode: 400, message: product.message, data: product.data?.data?.message };
        if (!product.data || product.data.length === 0) return { statusCode: 404, message: `No se encontró ningún producto con id ${productId}`, data: [] };

        // Regresar el producto
        return { statusCode: 200, message: 'Producto obtenido con éxito', data: product.data[0] };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Crea un nuevo producto en Odoo.
 * @param {Object} productInfo - Información del producto a crear.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Crea un nuevo producto en Odoo. Inserta un nuevo registro en el modelo 'product.template' con los datos proporcionados en productInfo. Tras la creación, retorna el producto recién creado consultando por su ID.
 * @param {Object} productInfo - Información del producto a crear (por ejemplo: { name, default_code, list_price }).
 * @returns {Promise<{statusCode: number, message: string, data: object|null}>} Objeto con el resultado de la operación, mensaje y datos del producto creado.
 */
exports.create = async (productInfo) => {
    try {
        //Crear el producto
        const newProduct = await odooService.query('product.template', 'create', { vals_list: [productInfo] });
        if (newProduct.error) return { statusCode: newProduct.status, message: newProduct.message, data: newProduct.data };
        if (!newProduct.success) return { statusCode: 400, message: newProduct.message, data: newProduct.data?.data?.message };

        //regresar el producto creado
        const response = await this.getById(newProduct.data);
        if (response.statusCode !== 200) return response;

        return { statusCode: 200, message: 'Producto creado con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
}

/**
 * Obtiene productos filtrados por los parámetros dados.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Producto' }).
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Obtiene una lista de productos filtrados según los parámetros dados. Realiza una búsqueda en el modelo 'product.template' usando los filtros proporcionados (por nombre, código, etc). Devuelve todos los productos que coincidan con los criterios.
 * @param {Object} filters - Filtros de búsqueda (por ejemplo, { name: 'Producto' }).
 * @returns {Promise<{statusCode: number, message: string, data: object[]}>} Objeto con el resultado de la búsqueda, mensaje y arreglo de productos encontrados.
 */
exports.getByFilters = async (filters) => {
    try {
        //Crear los filtros
        fetch_filters = [];
        for (const [key, value] of Object.entries(filters)) {
            fetch_filters.push([key, 'ilike', value]);
        }
        //Obtener los productos
        const response = await odooService.query('product.template', 'search_read', { domain: fetch_filters, fields: productFields });
        if (response.error) return { statusCode: response.status, message: response.message, data: response.data };
        if (!response.success) return { statusCode: 400, message: response.message, data: response.data?.data?.message };
        return { statusCode: 200, message: 'Productos obtenidos con éxito', data: response.data };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, message: "Error interno", data: e.message };
    }
};

/**
 * Elimina un producto por su ID.
 * @param {number|string} id - ID del producto a eliminar.
 * @returns {Promise<{statusCode: number, message: string, data: any}>}
 */
/**
 * Elimina un producto de Odoo por su ID. Busca y elimina el registro en el modelo 'product.template' usando el ID proporcionado. Si el producto existe y se elimina correctamente, retorna éxito.
 * @param {number|string} id - ID del producto a eliminar.
 * @returns {Promise<{statusCode: number, message: string, data: object[]}>} Objeto con el resultado de la operación, mensaje y datos vacíos si fue exitoso.
 */
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
        if (deleteResponse.error) return { statusCode: deleteResponse.status, message: deleteResponse.message, data: deleteResponse.data };
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
        if (updateResponse.error) return { statusCode: updateResponse.status, message: updateResponse.message, data: updateResponse.data };
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