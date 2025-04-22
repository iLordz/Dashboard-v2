const express = require('express');
const router = express.Router();
const {
    uploadData,
    getLatestData,
    deleteData
} = require('../controllers/excelController');

// POST - Subir/actualizar datos
router.post('/upload', uploadData);

// GET - Obtener últimos datos
router.get('/latest', getLatestData);

// DELETE - Borrar datos
router.delete('/delete', deleteData);

module.exports = router;