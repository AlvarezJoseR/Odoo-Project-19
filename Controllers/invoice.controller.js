const e = require('express');
const invoiceService = require('../Services/invoice.service');

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await invoiceService.getById(id || req.params.id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.create = async (req, res) => {
    try {
        const invoiceInfo = req.body;
        const result = await invoiceService.create(invoiceInfo);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productInfo = req.body;
        const result = await invoiceService.addProduct(id, productInfo);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productInfo = req.body;
        const result = await invoiceService.deleteProduct(id, productInfo);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.confirmInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await invoiceService.confirmInvoice(id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.draftInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await invoiceService.draftInvoice(id);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.payInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await invoiceService.payInvoice(id, data);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.createCreditNote = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await invoiceService.createCreditNote(id, data);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.createDebitNote = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await invoiceService.createDebitNote(id, data);
        res.status(result.statusCode).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
