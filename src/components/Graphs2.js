// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from 'react';
// import { Bar, Line, Pie } from 'react-chartjs-2';
// import { Chart as ChartJS } from 'chart.js/auto';
// import datos2 from '../contacts_visitors.json';

// const Graphs2 = (  ) => {
//     const [timeFilter, setTimeFilter] = useState('day');
//     const [metric, setMetric] = useState('Contact Duration');
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('general'); // Nuevo estado para pestañas

//     useEffect(() => {
//         if (datos2 && datos2.length > 0) {
//             setLoading(false);
//         } else {
//             console.error("No se encontraron datos en el archivo JSON");
//             setLoading(false);
//         }
//     }, []);

//     const groupByDevice = () => {
//         const devices = {};
//         datos2.forEach(item => {
//             const deviceName = item.Device || "Desconocido";
//             if (!devices[deviceName]) {
//                 devices[deviceName] = {
//                     count: 0,
//                     contactTimes: [],
//                     totalDuration: 0,
//                     genders: { male: 0, female: 0 },
//                     ageRanges: { '0-18': 0, '19-30': 0, '31-45': 0, '46-60': 0, '61+': 0 }
//                 };
//             }
//             devices[deviceName].count++;
//             devices[deviceName].totalDuration += parseInt(item['Contact Duration'] || 0);
//             devices[deviceName].genders[item.Gender]++;
//             devices[deviceName].contactTimes.push(new Date(item["Contact Start"]));

//             // Clasificar por edad
//             const age = parseInt(item.Age);
//             if (age <= 18) devices[deviceName].ageRanges['0-18']++;
//             else if (age <= 30) devices[deviceName].ageRanges['19-30']++;
//             else if (age <= 45) devices[deviceName].ageRanges['31-45']++;
//             else if (age <= 60) devices[deviceName].ageRanges['46-60']++;
//             else devices[deviceName].ageRanges['61+']++;
//         });
//         return devices;
//     };

//     const getTimeDistributionForDevice = (contactTimes) => {
//         const timeRanges = [0, 0, 0, 0, 0, 0, 0]; // 8-10, 10-12, ..., 20-22
//         contactTimes.forEach(time => {
//             const hour = time.getHours();
//             if (hour >= 8 && hour < 10) timeRanges[0]++;
//             else if (hour >= 10 && hour < 12) timeRanges[1]++;
//         });
//         return timeRanges;
//     };

//     const getAverageDurationByHour = (contactTimes) => {
//         const hours = Array(24).fill().map(() => ({ total: 0, count: 0 }));
//         contactTimes.forEach(time => {
//             const hour = time.getHours();
//             hours[hour].total += parseInt(time.duration); 
//             hours[hour].count++;
//         });
//         return hours.map(h => h.count > 0 ? (h.total / h.count) : 0).slice(8, 21); // De 8 AM a 9 PM
//     };
    

//     // Función para agrupar datos por rangos de edad
//     const groupByAgeRange = () => {
//         const ranges = {
//             '0-18': { count: 0, totalDuration: 0 },
//             '19-30': { count: 0, totalDuration: 0 },
//             '31-45': { count: 0, totalDuration: 0 },
//             '46-60': { count: 0, totalDuration: 0 },
//             '61+': { count: 0, totalDuration: 0 }
//         };

//         datos2.forEach(item => {
//             const age = parseInt(item.Age);
//             let range;

//             if (age <= 18) range = '0-18';
//             else if (age <= 30) range = '19-30';
//             else if (age <= 45) range = '31-45';
//             else if (age <= 60) range = '46-60';
//             else range = '61+';

//             ranges[range].count++;
//             ranges[range].totalDuration += parseInt(item['Contact Duration']);
//         });

//         return ranges;
//     };

//     // Función para agrupar datos por franja horaria
//     const groupByTimeRange = () => {
//         const timeRanges = {
//             '8-10': 0,
//             '10-12': 0,
//             '12-14': 0,
//             '14-16': 0,
//             '16-18': 0,
//             '18-20': 0,
//             '20-22': 0
//         };

//         datos2.forEach(item => {
//             const date = new Date(item["Contact Start"]);
//             const hours = date.getHours();
//             let range;

//             if (hours >= 8 && hours < 10) range = '8-10';
//             else if (hours >= 10 && hours < 12) range = '10-12';
//             else if (hours >= 12 && hours < 14) range = '12-14';
//             else if (hours >= 14 && hours < 16) range = '14-16';
//             else if (hours >= 16 && hours < 18) range = '16-18';
//             else if (hours >= 18 && hours < 20) range = '18-20';
//             else if (hours >= 20 && hours < 22) range = '20-22';
//             else return;

//             timeRanges[range]++;
//         });

//         return timeRanges;
//     };

//     const processData = () => {
//         if (!datos2 || datos2.length === 0) return { labels: [], datasets: [] };

//         const groupedData = {};

//         datos2.forEach(item => {
//             if (!item["Contact Start"]) return;

//             const date = new Date(item["Contact Start"]);
//             let key;

//             if (timeFilter === 'day') {
//                 key = date.toLocaleDateString('es-MX');
//             } else if (timeFilter === 'week') {
//                 const weekNumber = Math.ceil(date.getDate() / 7);
//                 key = `Semana ${weekNumber} - ${date.toLocaleString('es-MX', { month: 'long' })}`;
//             } else { // month
//                 key = date.toLocaleString('es-MX', { month: 'long' });
//             }

//             if (!groupedData[key]) {
//                 groupedData[key] = [];
//             }

//             groupedData[key].push(item);
//         });

//         const labels = Object.keys(groupedData).sort((a, b) => {
//             if (timeFilter === 'day') return new Date(a) - new Date(b);
//             return a.localeCompare(b);
//         });

//         const datasets = [];

//         if (metric === 'Gender') {
//             const maleData = [];
//             const femaleData = [];

//             labels.forEach(key => {
//                 const items = groupedData[key];
//                 const males = items.filter(item => item.Gender === 'male').length;
//                 const females = items.filter(item => item.Gender === 'female').length;
//                 const total = males + females;

//                 maleData.push(total > 0 ? (males / total * 100) : 0);
//                 femaleData.push(total > 0 ? (females / total * 100) : 0);
//             });

//             datasets.push({
//                 label: 'Masculino',
//                 data: maleData,
//                 backgroundColor: 'rgba(54, 162, 235, 0.6)'
//             });

//             datasets.push({
//                 label: 'Femenino',
//                 data: femaleData,
//                 backgroundColor: 'rgba(255, 99, 132, 0.6)'
//             });
//         } else {
//             const metricData = labels.map(key => {
//                 const items = groupedData[key];
//                 const validItems = items.filter(item => !isNaN(parseInt(item[metric])));
//                 const sum = validItems.reduce((acc, item) => acc + parseInt(item[metric]), 0);
//                 return validItems.length > 0 ? (sum / validItems.length) : 0;
//             });

//             datasets.push({
//                 label: metric,
//                 data: metricData,
//                 backgroundColor: 'rgba(153, 102, 255, 0.6)',
//                 borderColor: 'rgba(153, 102, 255, 1)',
//                 borderWidth: 1
//             });
//         }

//         return { labels, datasets };
//     };

//     const chartData = processData();
//     const isGenderChart = metric === 'Gender';
//     const ageRanges = groupByAgeRange();
//     const timeRanges = groupByTimeRange();

//     if (loading) {
//         return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//             <p>Cargando datos...</p>
//         </div>;
//     }

//     if (datos2.length === 0) {
//         return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//             <p>No se encontraron datos en el archivo JSON.</p>
//         </div>;
//     }

//     return (
//         <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
//             <h1 style={{ color: '#333', textAlign: 'center' }}>Dashboard</h1>

//             {/* Pestañas de navegación */}
//             <div style={{ display: 'flex', marginBottom: '10px', borderBottom: '1px solid #ddd', justifyContent: 'center', fontSize: '14px' }}>
//                 <button
// a6da7' : 'transparent', color: activeTab === 'general' ? 'white' : '#333', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('general')                    style={{ padding: '10px 20px', background: activeTab === 'general' ? '#4}>
//                     Vista general
//                 </button>
//                 <button
//                     style={{ padding: '10px 20px', background: activeTab === 'age' ? '#4a6da7' : 'transparent', color: activeTab === 'age' ? 'white' : '#333', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('age')}>
//                     Vista por edad
//                 </button>
//                 <button
//                     style={{ padding: '10px 20px', background: activeTab === 'time' ? '#4a6da7' : 'transparent', color: activeTab === 'time' ? 'white' : '#333', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('time')}>
//                     Vista por horario
//                 </button>
//                 <button
//                     style={{ padding: '10px 20px', background: activeTab === 'devices' ? '#4a6da7' : 'transparent', color: activeTab === 'devices' ? 'white' : '#333', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('devices')} >
//                     Vista por dispositivo
//                 </button>
//             </div>

//             {activeTab === 'general' && (
//                 <>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
//                         <div style={{ flex: 1, minWidth: '200px' }}>
//                             <h3 style={{ marginBottom: '10px' }}>Filtrar por: </h3>
//                             <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
//                                 <option value="day">Por día</option>
//                                 <option value="week">Por semana</option>
//                                 <option value="month">Por mes</option>
//                             </select>
//                         </div>

//                         <div style={{ flex: 1, minWidth: '200px' }}>
//                             <h3 style={{ marginBottom: '10px' }}>Métrica</h3>
//                             <select value={metric} onChange={(e) => setMetric(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
//                                 <option value="Contact Duration">Duración de contacto</option>
//                                 <option value="Age">Edad</option>
//                                 <option value="Gender">Género</option>
//                                 <option value="Age Deviation">Desviación de edad</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
//                         <h2 style={{ marginTop: 0, color: '#444' }}>{isGenderChart ? 'Distribución de Género' : `Análisis de ${metric}`}
//                         </h2>
//                         <div style={{ height: '400px' }}>
//                             {isGenderChart ? (
//                                 <Bar
//                                     data={chartData}
//                                     options={{
//                                         responsive: true,
//                                         maintainAspectRatio: false,
//                                         plugins: {
//                                             legend: { position: 'top' },
//                                             tooltip: {
//                                                 callbacks: {
//                                                     label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
//                                                 }
//                                             }
//                                         },
//                                         scales: {
//                                             y: {
//                                                 beginAtZero: true,
//                                                 max: 100,
//                                                 ticks: { callback: (value) => value + '%' }
//                                             }
//                                         }
//                                     }}
//                                 />
//                             ) : (
//                                 <Line
//                                     data={chartData} options={{
//                                         responsive: true, maintainAspectRatio: false, plugins: {
//                                             legend: { display: false },
//                                             tooltip: {
//                                                 callbacks: {
//                                                     label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}`
//                                                 }
//                                             }
//                                         },
//                                         scales: {
//                                             y: {
//                                                 beginAtZero: true,
//                                                 title: {
//                                                     display: true,
//                                                     text: metric === 'Age' ? 'Años' : metric === 'Contact Duration' ? 'Segundos' : 'Valor'
//                                                 }
//                                             }
//                                         }
//                                     }}
//                                 />
//                             )}
//                         </div>
//                     </div>

//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
//                         <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                             <h2 style={{ marginTop: 0, color: '#444' }}>Distribución por Género</h2>
//                             <div style={{ height: '300px' }}>
//                                 <Pie
//                                     data={{
//                                         labels: ['Masculino', 'Femenino'],
//                                         datasets: [{
//                                             data: [
//                                                 datos2.filter(item => item.Gender === 'male').length,
//                                                 datos2.filter(item => item.Gender === 'female').length
//                                             ],
//                                             backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
//                                         }]
//                                     }}
//                                     options={{
//                                         responsive: true,
//                                         maintainAspectRatio: false,
//                                         plugins: {
//                                             legend: { position: 'right' },
//                                             tooltip: {
//                                                 callbacks: {
//                                                     label: (context) => {
//                                                         const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                                                         const percentage = Math.round((context.raw / total) * 100);
//                                                         return `${context.label}: ${context.raw} (${percentage}%)`;
//                                                     }
//                                                 }
//                                             }
//                                         }
//                                     }}
//                                 />
//                             </div>
//                         </div>

//                         <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                             <h2 style={{ marginTop: 0, color: '#444' }}>Resumen de datos</h2>
//                             <div style={{ lineHeight: '1.8' }}>
//                                 <p><strong>Total de contactos:</strong> {datos2.length}</p>
//                                 <p><strong>Total de Hombres:</strong> {datos2.filter(item => item.Gender === 'male').length}</p>
//                                 <p><strong>Total de Mujeres:</strong> {datos2.filter(item => item.Gender === 'female').length}</p>
//                                 <p><strong>Duración promedio:</strong> {
//                                     (datos2.reduce((acc, item) => acc + parseInt(item['Contact Duration'] || 0), 0) / datos2.length).toFixed(1)
//                                 } segundos</p>
//                                 <p><strong>Edad promedio:</strong> {
//                                     (datos2.reduce((acc, item) => acc + parseInt(item['Age'] || 0), 0) / datos2.length).toFixed(1)
//                                 } años</p>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}

//             {activeTab === 'age' && (
//                 <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                     <h2 style={{ marginTop: 0, color: '#444' }}>Análisis por grupos de edad</h2>

//                     {/* Contenedor principal con flexbox column */}
//                     <div style={{
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '30px',
//                         maxWidth: '100%',
//                         overflow: 'hidden'
//                     }}>
//                         {/* Primera fila de gráficas / ahora en columnas en móviles */}
//                         <div style={{
//                             display: 'flex',
//                             flexDirection: window.innerWidth < 768 ? 'column' : 'row',
//                             gap: '20px',
//                             width: '100%'
//                         }}>
//                             <div style={{
//                                 flex: 1,
//                                 minHeight: '300px',
//                                 position: 'relative'
//                             }}>
//                                 <Bar
//                                     data={{
//                                         labels: Object.keys(ageRanges),
//                                         datasets: [{
//                                             label: 'Número de visitantes',
//                                             data: Object.values(ageRanges).map(range => range.count),
//                                             backgroundColor: 'rgba(75, 192, 192, 0.6)'
//                                         }]
//                                     }}
//                                     options={{
//                                         responsive: true,
//                                         maintainAspectRatio: false,
//                                         plugins: {
//                                             legend: { display: false },
//                                             tooltip: { callbacks: { label: (ctx) => `${ctx.raw} visitantes` } }
//                                         },
//                                         scales: {
//                                             y: { beginAtZero: true, title: { display: true, text: 'Número de visitantes' } },
//                                             x: { title: { display: true, text: 'Rango de edad' } }
//                                         }
//                                     }}
//                                 />
//                             </div>

//                             <div style={{
//                                 flex: 1,
//                                 minHeight: '300px',
//                                 position: 'relative'
//                             }}>
//                                 <Bar
//                                     data={{
//                                         labels: Object.keys(ageRanges),
//                                         datasets: [{
//                                             label: 'Duración promedio (seg)',
//                                             data: Object.values(ageRanges).map(range =>
//                                                 range.count > 0 ? (range.totalDuration / range.count).toFixed(1) : 0
//                                             ),
//                                             backgroundColor: 'rgba(153, 102, 255, 0.6)'
//                                         }]
//                                     }}
//                                     options={{
//                                         responsive: true,
//                                         maintainAspectRatio: false,
//                                         plugins: {
//                                             legend: { display: false },
//                                             tooltip: { callbacks: { label: (ctx) => `${ctx.raw} segundos` } }
//                                         },
//                                         scales: {
//                                             y: { beginAtZero: true, title: { display: true, text: 'Duración promedio (seg)' } },
//                                             x: { title: { display: true, text: 'Rango de edad' } }
//                                         }
//                                     }}
//                                 />
//                             </div>
//                         </div>

//                         {/* Segunda gráfica (ocupará todo el ancho) */}
//                         <div style={{
//                             width: '100%',
//                             height: '400px',
//                             position: 'relative'
//                         }}>
//                             <Bar
//                                 data={{
//                                     labels: ['0-18', '19-30', '31-45', '46-60', '61+'],
//                                     datasets: [
//                                         {
//                                             label: 'Hombres',
//                                             data: [
//                                                 datos2.filter(item => item.Gender === 'male' && parseInt(item.Age) <= 18).length,
//                                                 datos2.filter(item => item.Gender === 'male' && parseInt(item.Age) > 18 && parseInt(item.Age) <= 30).length,
//                                                 datos2.filter(item => item.Gender === 'male' && parseInt(item.Age) > 30 && parseInt(item.Age) <= 45).length,
//                                                 datos2.filter(item => item.Gender === 'male' && parseInt(item.Age) > 45 && parseInt(item.Age) <= 60).length,
//                                                 datos2.filter(item => item.Gender === 'male' && parseInt(item.Age) > 60).length
//                                             ],
//                                             backgroundColor: 'rgba(54, 162, 235, 0.6)'
//                                         },
//                                         {
//                                             label: 'Mujeres',
//                                             data: [
//                                                 datos2.filter(item => item.Gender === 'female' && parseInt(item.Age) <= 18).length,
//                                                 datos2.filter(item => item.Gender === 'female' && parseInt(item.Age) > 18 && parseInt(item.Age) <= 30).length,
//                                                 datos2.filter(item => item.Gender === 'female' && parseInt(item.Age) > 30 && parseInt(item.Age) <= 45).length,
//                                                 datos2.filter(item => item.Gender === 'female' && parseInt(item.Age) > 45 && parseInt(item.Age) <= 60).length,
//                                                 datos2.filter(item => item.Gender === 'female' && parseInt(item.Age) > 60).length
//                                             ],
//                                             backgroundColor: 'rgba(255, 99, 132, 0.6)'
//                                         }
//                                     ]
//                                 }}
//                                 options={{
//                                     responsive: true,
//                                     maintainAspectRatio: false,
//                                     plugins: {
//                                         legend: { position: 'top' },
//                                         tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` } }
//                                     },
//                                     scales: {
//                                         y: { beginAtZero: true, title: { display: true, text: 'Número de visitantes' } },
//                                         x: { title: { display: true, text: 'Rango de edad' } }
//                                     }
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {activeTab === 'time' && (
//                 <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                     <h2 style={{ marginTop: 0, color: '#444' }}>Análisis por horarios</h2>

//                     <div style={{ height: '500px', marginBottom: '30px' }}>
//                         <Bar
//                             data={{
//                                 labels: Object.keys(timeRanges),
//                                 datasets: [{
//                                     label: 'Contactos por hora',
//                                     data: Object.values(timeRanges),
//                                     backgroundColor: 'rgba(255, 159, 64, 0.6)'
//                                 }]
//                             }}
//                             options={{
//                                 responsive: true,
//                                 maintainAspectRatio: false,
//                                 plugins: {
//                                     legend: { display: false },
//                                     tooltip: { callbacks: { label: (ctx) => `${ctx.raw} contactos` } }
//                                 },
//                                 scales: {
//                                     y: { beginAtZero: true, title: { display: true, text: 'Número de contactos' } },
//                                     x: { title: { display: true, text: 'Franja horaria' } }
//                                 }
//                             }}
//                         />
//                     </div>

//                     <div style={{ height: '500px' }}>
//                         <Line
//                             data={{
//                                 labels: Object.keys(timeRanges),
//                                 datasets: [{
//                                     label: 'Tendencia de visitas',
//                                     data: Object.values(timeRanges),
//                                     borderColor: 'rgba(75, 192, 192, 1)',
//                                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                                     fill: true,
//                                     tension: 0.4
//                                 }]
//                             }}
//                             options={{
//                                 responsive: true,
//                                 maintainAspectRatio: false,
//                                 plugins: {
//                                     legend: { display: false },
//                                     tooltip: { callbacks: { label: (ctx) => `${ctx.raw} contactos` } }
//                                 },
//                                 scales: {
//                                     y: { beginAtZero: true, title: { display: true, text: 'Número de contactos' } },
//                                     x: { title: { display: true, text: 'Franja horaria' } }
//                                 }
//                             }}
//                         />
//                     </div>
//                 </div>
//             )}

//             {activeTab === 'devices' && (
//                 <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                     <h2 style={{ marginTop: 0, color: '#444' }}>Análisis por Dispositivo</h2>

//                     {/* Gráfico de contactos por dispositivo */}
//                     <div style={{ width: '100%', height: '500px', marginBottom: '30px' }}>
//                         <Bar
//                             data={{
//                                 labels: Object.keys(groupByDevice()),
//                                 datasets: [{
//                                     label: 'Contactos por dispositivo',
//                                     data: Object.values(groupByDevice()).map(device => device.count),
//                                     backgroundColor: 'rgba(53, 162, 235, 0.6)',
//                                 }]
//                             }}
//                             options={{
//                                 responsive: true,
//                                 maintainAspectRatio: false,
//                                 plugins: {
//                                     legend: { display: false },
//                                 },
//                                 scales: {
//                                     y: { beginAtZero: true, title: { display: true, text: 'Número de contactos' } }
                                    
//                                 }
//                             }}
//                         />
//                     </div>

//                     {/* Gráfico de género por dispositivo */}
//                     <div style={{ height: '500px', marginBottom: '30px' }}>
//                         <Bar
//                             data={{
//                                 labels: Object.keys(groupByDevice()),
//                                 datasets: [
//                                     {
//                                         label: 'Hombres',
//                                         data: Object.values(groupByDevice()).map(device => device.genders.male),
//                                         backgroundColor: 'rgba(54, 162, 235, 0.6)',
//                                     },
//                                     {
//                                         label: 'Mujeres',
//                                         data: Object.values(groupByDevice()).map(device => device.genders.female),
//                                         backgroundColor: 'rgba(255, 99, 132, 0.6)',
//                                     }
//                                 ]
//                             }}
//                             options={{
//                                 responsive: true,
//                                 maintainAspectRatio: false,
//                                 plugins: { legend: { display: false } },
//                                 scales: {
//                                     y: { beginAtZero: true, stacked: false, title: { display: true, text: 'Número de contactos' } },
//                                     x: { title: { display: true, text: 'Dispositivo' }}
//                                 }
//                             }}
//                         />
//                     </div>

//                     <div style={{ height: '500px', marginBottom: '30px' }}>
//                         <Bar
//                             data={{
//                                 labels: ['8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22'],
//                                 datasets: Object.entries(groupByDevice()).map(([device, data]) => ({
//                                     label: device,
//                                     data: getTimeDistributionForDevice(data.contactTimes), // Nueva función
//                                 }))
//                             }}
//                             options={{
//                                 responsive: true,
//                                 maintainAspectRatio: false,
//                                 plugins: { legend: { display: false } },
//                                 scales: {
//                                     y: { beginAtZero: true, title: { display: true, text: 'Número de contactos' } },
//                                     x: { title: { display: true, text: 'Horario' } }
//                                 }
//                             }}
//                         />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Graphs2;