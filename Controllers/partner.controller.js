const e = require('express');
const partnerService = require('../Services/partner.service');

// Métodos del controller de partner
exports.getByFilters = async (req, res) => {
    try {
        const filters = req.query;
        const response = await partnerService.getByFilters(filters);
        res.status(response.statusCode).json(response);
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
        res.status(500).json({ statusCode: 500, message: 'Error interno del servidor', data: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const partnerInfo = req.body;
        const response = await partnerService.create(partnerInfo);
        res.status(response.statusCode).json(response);
    } catch (e) {
        console.error(e);
        res.status(500).json({ statusCode: 500, message: 'Error interno del servidor', data: e.message });// Modificado para incluir el mensaje de error
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const partnerInfo = req.body;
        const response = await partnerService.update(id, partnerInfo);
        res.status(response.statusCode).json(response);
    } catch (e) {
        console.error(e);
        res.status(500).json({ statusCode: 500, message: 'Error interno del servidor', data: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await partnerService.delete(id);
        res.status(response.statusCode).json(response);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.addContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contactInfo = req.body;
        const response = await partnerService.addContact(id, contactInfo);
        res.status(response.statusCode).json(response);
    } catch (e) {
        console.error(e);
        res.status(500).json({ statusCode: 500, message: 'Error interno del servidor', data: e.message });
    }
};

