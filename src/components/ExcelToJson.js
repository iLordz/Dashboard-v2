import React from "react";
import * as XLSX from "xlsx";

const ExcelToJson = ({ onDataProcessed }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const binaryString = event.target.result;
                const wb = XLSX.read(binaryString, { type: "binary" });
                const firstSheetName = wb.SheetNames[0];
                const sheet = wb.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Verifica que onDataProcessed sea una función antes de llamarla
                if (typeof onDataProcessed === 'function') {
                    onDataProcessed(jsonData, file.name);
                } else {
                    console.error('onDataProcessed no es una función');
                }
            } catch (error) {
                console.error('Error al procesar el archivo:', error);
            }
        };
        
        reader.onerror = () => {
            console.error('Error al leer el archivo');
        };
        
        reader.readAsBinaryString(file);
    };

    return (
        <div className="container">
            <div style={{ margin: "20px 0" }}>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}/>
            </div>
        </div>
    )
}

export default ExcelToJson
