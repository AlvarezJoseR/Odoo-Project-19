//Service
const utilService = require('./../Services/util.service');

//Auth 
exports.getModel = async (req, res) => {
    try {
        const model = req.query.name;
        const response = await utilService.getModel(model);
        console.log(response)
        res.status(response.statusCode).json(response);
    } catch (e) {
        res.status(500).json({statusCode: 500, message: "Error interno", data: e.message});
    }

};