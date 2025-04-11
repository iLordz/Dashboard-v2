import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Configuración de estilo original para las gráficas
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 14
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
            padding: 12
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0,0,0,0.05)'
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    },
    elements: {
        
        line: {
            tension: 0.4
        }
    }
};



// Funciones para IndexedDB
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ExcelGraphsDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('excelData')) {
                db.createObjectStore('excelData', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveDataToDB = async (data, fileName) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('excelData', 'readwrite');
        const store = transaction.objectStore('excelData');
        store.put({
            id: 1,
            data,
            fileName,
            timestamp: new Date().getTime()
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

const loadDataFromDB = async () => {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction('excelData', 'readonly');
        const store = transaction.objectStore('excelData');
        const request = store.get(1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
    });
};

const Graphs3 = () => {
    // Estados
    const [timeFilter, setTimeFilter] = useState('day');
    const [metric, setMetric] = useState('Contact Duration');
    const [activeTab, setActiveTab] = useState('general');
    const [data, setData] = useState([]);
    const [, setFileName] = useState('');
    const [loading, setLoading] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cargar datos al iniciar
    useEffect(() => {
        const loadData = async () => {
            // 1. Intentar desde localStorage
            const localData = localStorage.getItem('excelData');
            const localFileName = localStorage.getItem('excelFileName');

            if (localData) {
                setData(JSON.parse(localData));
                setFileName(localFileName || '');
                setLoading(false);
            }

            // 2. Intentar desde IndexedDB
            try {
                const dbData = await loadDataFromDB();
                if (dbData && dbData.data) {
                    setData(dbData.data);
                    setFileName(dbData.fileName || '');
                    localStorage.setItem('excelData', JSON.stringify(dbData.data));
                    localStorage.setItem('excelFileName', dbData.fileName);
                }
            } catch (error) {
                console.error("Error loading from IndexedDB:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Guardar datos
    const saveData = async (jsonData, filename) => {
        try {
            localStorage.setItem('excelData', JSON.stringify(jsonData));
            localStorage.setItem('excelFileName', filename);
            await saveDataToDB(jsonData, filename);
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    // Procesar archivo Excel
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const binaryString = event.target.result;
                const wb = XLSX.read(binaryString, { type: "binary" });
                const firstSheet = wb.Sheets[wb.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Validar campos requeridos
                const requiredFields = ['Contact Duration', 'Gender', 'Age', 'Contact Start', 'Device'];
                const missingFields = requiredFields.filter(field => !(field in jsonData[0]));

                if (missingFields.length > 0) {
                    throw new Error(`Faltan campos: ${missingFields.join(', ')}`);
                }

                await saveData(jsonData, file.name);
                setData(jsonData);
                setFileName(file.name);
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            alert("Error al leer el archivo, intente de nuevo.");
            setLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    // Funciones de procesamiento de datos
    const groupByDevice = () => {
        const devices = {};
        data.forEach(item => {
            const deviceName = item.Device || "Desconocido";
            if (!devices[deviceName]) {
                devices[deviceName] = {
                    count: 0,
                    contactTimes: [],
                    totalDuration: 0,
                    genders: { male: 0, female: 0 },
                    ageRanges: { '0-18': 0, '19-30': 0, '31-45': 0, '46-60': 0, '61+': 0 }
                };
            }
            devices[deviceName].count++;
            devices[deviceName].totalDuration += parseInt(item['Contact Duration'] || 0);
            if (item.Gender) devices[deviceName].genders[item.Gender]++;
            if (item["Contact Start"]) devices[deviceName].contactTimes.push(new Date(item["Contact Start"]));

            const age = parseInt(item.Age) || 0;
            if (age <= 18) devices[deviceName].ageRanges['0-18']++;
            else if (age <= 30) devices[deviceName].ageRanges['19-30']++;
            else if (age <= 45) devices[deviceName].ageRanges['31-45']++;
            else if (age <= 60) devices[deviceName].ageRanges['46-60']++;
            else devices[deviceName].ageRanges['61+']++;
        });
        return devices;
    };

    const groupByAgeRange = () => {
        const ranges = {
            '0-18': { count: 0, totalDuration: 0 },
            '19-30': { count: 0, totalDuration: 0 },
            '31-45': { count: 0, totalDuration: 0 },
            '46-60': { count: 0, totalDuration: 0 },
            '61+': { count: 0, totalDuration: 0 }
        };

        data.forEach(item => {
            const age = parseInt(item.Age) || 0;
            let range;

            if (age <= 18) range = '0-18';
            else if (age <= 30) range = '19-30';
            else if (age <= 45) range = '31-45';
            else if (age <= 60) range = '46-60';
            else range = '61+';

            ranges[range].count++;
            ranges[range].totalDuration += parseInt(item['Contact Duration'] || 0);
        });

        return ranges;
    };

    const groupByTimeRange = () => {
        const timeRanges = {
            '8-10': 0,
            '10-12': 0,
            '12-14': 0,
            '14-16': 0,
            '16-18': 0,
            '18-20': 0,
            '20-22': 0
        };

        data.forEach(item => {
            if (!item["Contact Start"]) return;

            const date = new Date(item["Contact Start"]);
            const hours = date.getHours();
            let range;

            if (hours >= 8 && hours < 10) range = '8-10';
            else if (hours >= 10 && hours < 12) range = '10-12';
            else if (hours >= 12 && hours < 14) range = '12-14';
            else if (hours >= 14 && hours < 16) range = '14-16';
            else if (hours >= 16 && hours < 18) range = '16-18';
            else if (hours >= 18 && hours < 20) range = '18-20';
            else if (hours >= 20 && hours < 22) range = '20-22';
            else return;

            timeRanges[range]++;
        });

        return timeRanges;
    };

    const processData = () => {
        if (!data || data.length === 0) return { labels: [], datasets: [] };

        const groupedData = {};

        data.forEach(item => {
            if (!item["Contact Start"]) return;

            const date = new Date(item["Contact Start"]);
            let key;

            if (timeFilter === 'day') {
                key = date.toLocaleDateString('es-MX');
            } else if (timeFilter === 'week') {
                const weekNumber = Math.ceil(date.getDate() / 7);
                key = `Semana ${weekNumber} - ${date.toLocaleString('es-MX', { month: 'long' })}`;
            } else { // month
                key = date.toLocaleString('es-MX', { month: 'long' });
            }

            if (!groupedData[key]) {
                groupedData[key] = [];
            }

            groupedData[key].push(item);
        });

        const labels = Object.keys(groupedData).sort((a, b) => {
            if (timeFilter === 'day') return new Date(a) - new Date(b);
            return a.localeCompare(b);
        });

        const datasets = [];

        if (metric === 'Gender') {
            const maleData = [];
            const femaleData = [];

            labels.forEach(key => {
                const items = groupedData[key];
                const males = items.filter(item => item.Gender === 'male').length;
                const females = items.filter(item => item.Gender === 'female').length;
                const total = males + females;

                maleData.push(total > 0 ? (males / total * 100) : 0);
                femaleData.push(total > 0 ? (females / total * 100) : 0);
            });

            datasets.push({
                label: 'Masculino',
                data: maleData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            });

            datasets.push({
                label: 'Femenino',
                data: femaleData,
                backgroundColor: 'rgba(255, 99, 132, 0.7)'
            });
        } else {
            const metricData = labels.map(key => {
                const items = groupedData[key];
                const validItems = items.filter(item => !isNaN(parseInt(item[metric])));
                const sum = validItems.reduce((acc, item) => acc + parseInt(item[metric]), 0);
                return validItems.length > 0 ? (sum / validItems.length) : 0;
            });

            datasets.push({
                label: metric,
                data: metricData,
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2
            });
        }

        return { labels, datasets };
    };

    // Renderizado
    if (loading && data.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',

            }}>
                <h1 style={{ color: '#333' }}>Visualizador de Datos Excel</h1>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                />
                <p>Sube un archivo Excel para comenzar</p>
            </div>
        );
    }
    const getTimeDistributionForDevice = (contactTimes) => {
        const timeRanges = Array(7).fill(0); // [8-10, 10-12, 12-14, 14-16, 16-18, 18-20, 20-22]

        contactTimes.forEach(time => {
            if (!(time instanceof Date)) return;

            const hour = time.getHours();
            if (hour >= 8 && hour < 10) timeRanges[0]++;
            else if (hour >= 10 && hour < 12) timeRanges[1]++;
            else if (hour >= 12 && hour < 14) timeRanges[2]++;
            else if (hour >= 14 && hour < 16) timeRanges[3]++;
            else if (hour >= 16 && hour < 18) timeRanges[4]++;
            else if (hour >= 18 && hour < 20) timeRanges[5]++;
            else if (hour >= 20 && hour < 22) timeRanges[6]++;
        });

        return timeRanges;
    };

    const chartData = processData();
    const isGenderChart = metric === 'Gender';
    const ageRanges = groupByAgeRange();
    const timeRanges = groupByTimeRange();
    const devicesData = groupByDevice();

    return (
        <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#333', textAlign: 'center' }}>Dashboard</h1>

            {/* Controles superiores */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
                gap: '15px',
                flexWrap: 'wrap'
            }}>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ padding: '10px 15px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} />
                {data.length > 0 && (
                    <button className='btn btn-danger' onClick={() => {
                        if (window.confirm('¿Estas seguro de borrar todos los datos?')) {
                            localStorage.removeItem('excelData');
                            localStorage.removeItem('excelFileName');
                            setData([]);
                            setFileName('');
                        }
                    }}
                    >Borrar datos</button>
                )}
            </div>

            {data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '20px' }}>
                    <p>Sube un archivo Excel para comenzar.</p>
                </div>
            ) : (
                <>
                    {/* Pestañas */}
                    <div style={{ display: 'flex', marginBottom: '10px', borderBottom: '1px solid #ddd', justifyContent: 'center', fontSize: '14px' }}>
                        {['general', 'age', 'time', 'devices'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{ padding: '10px 20px', backgroundColor: activeTab === tab ? '#4a6da7' : '#f0f0f0', color: activeTab === tab ? 'white' : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s', fontSize: '14px' }}>
                                {tab === 'general' && 'Vista general'}
                                {tab === 'age' && 'Vista por edad'}
                                {tab === 'time' && 'Vista por horario'}
                                {tab === 'devices' && 'Vista por dispositivo'}
                            </button>
                        ))}
                    </div>

                    {/* Contenido de pestañas */}
                    {activeTab === 'general' && (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '25px',
                                flexWrap: 'wrap',
                                gap: '20px'
                            }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ marginBottom: '10px' }}>Filtrar por: </h3>
                                    <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                        <option value="day">Por día</option>
                                        <option value="week">Por semana</option>
                                        <option value="month">Por mes</option>
                                    </select>
                                </div>

                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ marginBottom: '10px' }}>Métrica</h3>
                                    <select value={metric} onChange={(e) => setMetric(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                        <option value="Contact Duration">Duración de contacto</option>
                                        <option value="Age">Edad</option>
                                        <option value="Gender">Género</option>
                                        <option value="Age Deviation">Desviación de edad</option>
                                    </select>
                                </div>
                            </div>

                            {/* Gráfico principal */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                marginBottom: '30px'
                            }}>
                                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#444' }}>
                                    {isGenderChart ? 'Distribución por Género' : `Análisis de ${metric}`}
                                </h2>
                                <div style={{ height: '400px' }}>
                                    {isGenderChart ? (
                                        <Bar
                                            data={chartData}
                                            options={{
                                                ...chartOptions,
                                                scales: {
                                                    ...chartOptions.scales,
                                                    y: {
                                                        ...chartOptions.scales.y,
                                                        max: 100,
                                                        ticks: {
                                                            callback: (value) => value + '%'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Line
                                            data={chartData}
                                            options={{
                                                ...chartOptions,
                                                plugins: {
                                                    ...chartOptions.plugins,
                                                    legend: {
                                                        display: false
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Gráficos secundarios */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '20px',
                                marginBottom: '30px'
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#444' }}>Distribución por Género</h2>
                                    <div style={{ height: '300px' }}>
                                        <Pie
                                            data={{
                                                labels: ['Masculino', 'Femenino'],
                                                datasets: [{
                                                    data: [
                                                        data.filter(item => item.Gender === 'male').length,
                                                        data.filter(item => item.Gender === 'female').length
                                                    ],
                                                    backgroundColor: [
                                                        'rgba(54, 162, 235, 0.7)',
                                                        'rgba(255, 99, 132, 0.7)'
                                                    ],
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                        labels: {
                                                            font: {
                                                                size: 14
                                                            }
                                                        }
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                const percentage = Math.round((context.raw / total) * 100);
                                                                return `${context.label}: ${context.raw} (${percentage}%)`;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        display: false
                                                    },
                                                    y: {
                                                        display: false
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#444' }}>Resumen general</h2>
                                    <div style={{ lineHeight: '1.8', fontSize: '15px' }}>
                                        <p><strong>Total de registros:</strong> {data.length}</p>
                                        <p><strong>Total de Hombres:</strong> {data.filter(item => item.Gender === 'male').length}</p>
                                        <p><strong>Total de Mujeres:</strong> {data.filter(item => item.Gender === 'female').length}</p>
                                        <p><strong>Duración promedio:</strong> {(
                                            data.reduce((acc, item) => acc + (parseInt(item['Contact Duration']) || 0), 0) /
                                            data.length
                                        ).toFixed(1)} segundos</p>
                                        <p><strong>Edad promedio:</strong> {(
                                            data.reduce((acc, item) => acc + (parseInt(item.Age) || 0), 0) /
                                            data.length
                                        ).toFixed(1)} años</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'age' && (
                        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ marginTop: 0, color: '#444' }}>Análisis por grupos de edad</h2>

                            <div style={{
                                display: 'flex',
                                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                gap: '20px',
                                width: '100%'
                            }}>
                                <div style={{
                                    flex: 1,
                                    minHeight: '300px',
                                    position: 'relative'
                                }}>
                                    <Bar
                                        data={{
                                            labels: Object.keys(ageRanges),
                                            datasets: [{
                                                label: 'Número de visitantes',
                                                data: Object.values(ageRanges).map(range => range.count),
                                                backgroundColor: 'rgba(75, 192, 192, 0.6)'
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: { callbacks: { label: (ctx) => `${ctx.raw} visitantes` } }
                                            },
                                            scales: {
                                                y: { beginAtZero: true, title: { display: true, text: 'Número de visitantes' } },
                                                x: { title: { display: true, text: 'Rango de edad' } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Duración promedio por edad</h3>
                                <div style={{
                                    flex: 1,
                                    minHeight: '300px',
                                    position: 'relative'
                                }}>
                                    <Bar
                                        data={{
                                            labels: Object.keys(ageRanges),
                                            datasets: [{
                                                label: 'Duración promedio (seg)',
                                                data: Object.values(ageRanges).map(range =>
                                                    range.count > 0 ? (range.totalDuration / range.count).toFixed(1) : 0
                                                ),
                                                backgroundColor: 'rgba(153, 102, 255, 0.7)'
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: { callbacks: { label: (ctx) => `${ctx.raw} segundos` } }
                                            },
                                            scales: {
                                                y: { beginAtZero: true, title: { display: true, text: 'Duración promedio (seg)' } },
                                                x: { title: { display: true, text: 'Rango de edad' } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '15px' }}>Distribución por género y edad</h3>
                                <div style={{
                                    width: '100%',
                                    height: '400px',
                                    position: 'relative'
                                }}>
                                    <Bar
                                        data={{
                                            labels: Object.keys(ageRanges),
                                            datasets: [
                                                {
                                                    label: 'Hombres',
                                                    data: Object.keys(ageRanges).map(range => {
                                                        const [min, max] = range === '61+' ? [61, 200] : range.split('-').map(Number);
                                                        return data.filter(item =>
                                                            item.Gender === 'male' &&
                                                            parseInt(item.Age) >= min &&
                                                            (range === '61+' || parseInt(item.Age) <= max)
                                                        ).length;
                                                    }),
                                                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                                                },
                                                {
                                                    label: 'Mujeres',
                                                    data: Object.keys(ageRanges).map(range => {
                                                        const [min, max] = range === '61+' ? [61, 200] : range.split('-').map(Number);
                                                        return data.filter(item =>
                                                            item.Gender === 'female' &&
                                                            parseInt(item.Age) >= min &&
                                                            (range === '61+' || parseInt(item.Age) <= max)
                                                        ).length;
                                                    }),
                                                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'top' },
                                                tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` } }
                                            },
                                            scales: {
                                                y: { beginAtZero: true, title: { display: true, text: 'Número de visitantes' } },
                                                x: { title: { display: true, text: 'Rango de edad' } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'time' && (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: '25px', color: '#444' }}>Análisis por Horarios</h2>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Contactos por hora del día</h3>
                                <div style={{ height: '500px' }}>
                                    <Bar
                                        data={{
                                            labels: Object.keys(timeRanges),
                                            datasets: [{
                                                label: 'Contactos',
                                                data: Object.values(timeRanges),
                                                backgroundColor: 'rgba(255, 159, 64, 0.7)'
                                            }]
                                        }}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '15px' }}>Tendencia de Contactos</h3>
                                <div style={{ height: '500px' }}>
                                    <Line
                                        data={{
                                            labels: Object.keys(timeRanges),
                                            datasets: [{
                                                label: 'Contactos',
                                                data: Object.values(timeRanges),
                                                borderColor: 'rgba(75, 192, 192, 1)',
                                                backgroundColor: 'rgba(75, 192, 192, 0.2)',

                                                fill: true,
                                                tension: 0.4
                                            }]
                                        }}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'devices' && (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: '25px', color: '#444' }}>Análisis por Dispositivo</h2>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Contactos por Dispositivo</h3>
                                <div style={{ height: isMobile ? '300px' : '500px' }}>
                                    <Bar
                                        data={{
                                            labels: Object.keys(devicesData),
                                            datasets: [{
                                                label: 'Contactos',
                                                data: Object.values(devicesData).map(device => device.count),
                                                backgroundColor: 'rgba(53, 162, 235, 0.7)'
                                            }]
                                        }}
                                        options={isMobile ? {
                                            ...chartOptions,
                                            scales: {
                                                ...chartOptions.scales,
                                                x: { display: false },
                                                y: { display: true }
                                            }
                                        } : chartOptions}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Distribución por Género</h3>
                                <div style={{ height: isMobile ? '300px' : '500px' }}>
                                    <Bar
                                        data={{
                                            labels: Object.keys(devicesData),
                                            datasets: [
                                                {
                                                    label: 'Hombres',
                                                    data: Object.values(devicesData).map(device => device.genders.male),
                                                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                                                },
                                                {
                                                    label: 'Mujeres',
                                                    data: Object.values(devicesData).map(device => device.genders.female),
                                                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                                                }
                                            ]
                                        }}
                                        options={isMobile ? {
                                            ...chartOptions,
                                            scales: {
                                                ...chartOptions.scales,
                                                x: { display: false },
                                                y: { display: true }
                                            },
                                            plugins: {
                                                ...chartOptions.plugins,
                                                legend: {
                                                    position: 'top'
                                                }
                                            }
                                        } : chartOptions}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '15px' }}>Horarios de Uso por Dispositivo</h3>
                                <div style={{ height: isMobile ? '400px' : '600px' }}>
                                    <Bar
                                        data={{
                                            
                                            labels: isMobile ?
                                                ['8-10h', '10-12h', '12-14h', '14-16h', '16-18h', '18-20h', '20-22h'] :
                                                ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM', '8:00 PM - 10:00 PM'],
                                            datasets: Object.entries(devicesData).map(([device, data]) => ({
                                                label: device,
                                                data: getTimeDistributionForDevice(data.contactTimes),
                                                backgroundColor: `hsla(${Math.random() * 360}, 70%, 60%, 0.7)`
                                            }))
                                        }}
                                        options={{
                                            ...chartOptions,
                                            scales: {
                                                ...chartOptions.scales,
                                                x: {
                                                    display: !isMobile,
                                                    ticks: {
                                                        maxRotation: isMobile ? 90 : 0,
                                                        minRotation: isMobile ? 90 : 0
                                                    }
                                                }
                                            },
                                            plugins: {
                                                ...chartOptions.plugins,
                                                legend: {
                                                    position: isMobile ? 'bottom' : 'bottom',
                                                    labels: {
                                                        boxWidth: 12,
                                                        padding: 20,
                                                        font: {
                                                            size: isMobile ? 10 : 12
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Graphs3;