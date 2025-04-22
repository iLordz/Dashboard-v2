const mongoose = require('mongoose');

const excelDataSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    data: {
        type: Array,
        required: true
    },
    userId: {
        type: String,
        default: 'global' // Para multi-usuario cambiar esto
    }
}, { timestamps: true }); // Añade createdAt y updatedAt

module.exports = mongoose.model('ExcelData', excelDataSchema);