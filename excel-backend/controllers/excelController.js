const ExcelData = require('../models/ExcelData');

// Guardar o actualizar datos
exports.uploadData = async (req, res) => {
    try {
        const { fileName, data, userId = 'global' } = req.body;

        if (!fileName || !data) {
            return res.status(400).json({ error: 'Nombre y datos son requeridos' });
        }

        // Busca y actualiza o crea nuevo registro
        let excelData = await ExcelData.findOne({ userId });
        if (!excelData) {
            excelData = new ExcelData({ fileName, data, userId });
        } else {
            excelData.fileName = fileName;
            excelData.data = data;
        }

        await excelData.save();
        res.status(200).json(excelData);

    } catch (error) {
        res.status(500).json({ error: 'Error al guardar datos' });
    }
};

// Obtener últimos datos
exports.getLatestData = async (req, res) => {
    try {
        const { userId = 'global' } = req.query;
        const excelData = await ExcelData.findOne({ userId }).sort({ updatedAt: -1 });
        res.status(200).json(excelData || { data: [], fileName: '' });

    } catch (error) {
        res.status(500).json({ error: 'Error al cargar datos' });
    }
};

// Eliminar datos (para el botón "Borrar Datos")
exports.deleteData = async (req, res) => {
    try {
        const { userId = 'global' } = req.body;
        await ExcelData.deleteMany({ userId });
        res.status(200).json({ message: 'Datos eliminados' });

    } catch (error) {
        res.status(500).json({ error: 'Error al borrar datos' });
    }
};