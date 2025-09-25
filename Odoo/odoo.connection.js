const URL = process.env.ODOO_URL;
const UID = process.env.ODOO_UID;
const DB = process.env.ODOO_DB;
const API_KEY = process.env.ODOO_API_KEY;

//import axios
const axios = require('axios');
/**
 * Realiza una petición POST al API de Odoo para ejecutar un método sobre un modelo específico.
 *
 * @param {string} model - Nombre del modelo de Odoo (por ejemplo, 'res.partner').
 * @param {string} method - Nombre del método a ejecutar en el modelo (por ejemplo, 'search_read').
 * @param {Object} [body={}] - Objeto con los parámetros que se enviarán en el cuerpo de la petición.
 * @returns {Promise<{success: boolean, data: any, message?: string, error?: boolean}>} Objeto con el resultado de la petición.
 */
exports.query = async (
    service = 'object',
    method = 'execute_kw',
    args = []) => {
    try {
        const params = { service, method, args: [DB, UID, API_KEY, ...args] };
        console.log(params);
        const { data } = await axios.post(URL, {
            jsonrpc: "2.0",
            method: "call",
            params: params,
            id: new Date().getTime()
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });


        if (data && data.error) {
            const Msg =
                data.error?.data?.message ||
                data.error?.message ||
                data.error?.data?.debug ||
                'Error en la consulta a Odoo';

            const error = new Error(Msg);
            error.status = 502;



            return { success: false, message: "Error en la consulta de Odoo",  data: data.error };
        }

        return { success: true, message: "Consulta realizada con exito", data: data.result };

    } catch (error) {
        console.error('Error en la consulta a Odoo:', error);
        return { success: false, error: true, data: error.message, message: 'Error en la consulta a Odoo' };
    }
};