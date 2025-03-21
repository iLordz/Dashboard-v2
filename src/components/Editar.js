import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
registerLocale('es', es);
setDefaultLocale('es');

const Editar = ({ usuario }) => {
    const handleLogout = async () => {
        try {
            const response = await fetch("https://api.jaison.mx/Analisis_Perros/index.php?action=logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await response.text();
            console.log("Respuesta del servidor:", data);

            if (response.ok) {
                localStorage.removeItem("token");
                window.location.href = "/app1";
            } else {
                console.error("Error al cerrar sesión:", data);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [fecha_inicio, setFechaInicio] = useState("");
    const [fecha_fin, setFechaFin] = useState("");
    const [hora_inicio, setHoraInicio] = useState("");
    const [hora_fin, setHoraFin] = useState("");
    const [escalados, setEscalados] = useState([]);
    const [devices, setDevices] = useState([]);

    const handleFechaInicioChange = (date) => {
        setFechaInicio(date);
        if (fecha_fin && date > fecha_fin) {
            setFechaFin(date);
        }
    };
    const handleHoraInicioChange = (event) => {
        const nuevaHoraInicio = event.target.value;
        setHoraInicio(nuevaHoraInicio);

        if (hora_fin && nuevaHoraInicio > hora_fin) {
            setHoraFin(nuevaHoraInicio);
        }
    };

    const getVideoThumbnail = (videoSrc) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = `https://api.jaison.mx/${videoSrc}`;
            video.load();

            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnail = canvas.toDataURL();
                resolve(thumbnail);
            };

            video.onerror = reject;
        });
    };

    const handleEdit = (index) => {
        const imagenSeleccionada = imagenes[index];
        setEditIndex(index);
        setEditedData({ ...imagenSeleccionada });

        // Asigna los valores actuales de la imagen seleccionada a los estados correspondientes
        setFechaInicio(imagenSeleccionada.fecha_inicio);
        setFechaFin(imagenSeleccionada.fecha_fin);
        setHoraInicio(imagenSeleccionada.hora_inicio);
        setHoraFin(imagenSeleccionada.hora_fin);

        // Asigna los valores de prioridad, escalado y dispositivo
        setEditedData((prevState) => ({
            ...prevState,
            prioridad: imagenSeleccionada.prioridad || "",
            escalado: imagenSeleccionada.escalado || "",
            id: imagenSeleccionada.id || imagenSeleccionada.media_id || "", // Ajusta aquí según el nombre correcto
        }));
    };

    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({});
    };

    // const handleChange = (field, value) => {
    //     setEditedData(prevState => ({ ...prevState, [field]: value }));
    // };

    const handleSave = async () => {
        if (!editedData.id) {
            alert("Error: El ID no está definido.");
            return;
        }

        console.log("Enviando a la API con ID:", editedData.id); // Verifica si el ID es válido

        try {
            const response = await fetch(`https://api.jaison.mx/raspi/api.php?action=editarimg&id=${editedData.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: editedData.nombre,
                    descripcion: editedData.descripcion,
                    prioridad: editedData.prioridad,
                    escalado: editedData.escalado,
                    device: editedData.device
                }),
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                alert("Datos guardados con éxito");
            } else {
                alert("Error al guardar: " + result.error);
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar. Verifica la conexión con la API.");
        }
    };

    useEffect(() => {
        const fetchImages = () => {
            fetch('https://api.jaison.mx/raspi/api.php?action=listarImagenes')
                .then(response => response.json())
                .then(async data => {
                    if (data && Array.isArray(data.data)) {
                        const updatedImagenes = await Promise.all(
                            data.data.map(async (imagen) => {
                                if (imagen.src.endsWith('.mp4')) {
                                    const thumbnail = await getVideoThumbnail(imagen.src);
                                    return { ...imagen, thumbnail };
                                }
                                return imagen;
                            })
                        );
                        setImagenes(updatedImagenes);
                    } else {
                        setImagenes([]);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error al obtener las imágenes:', error);
                    setLoading(false);
                });
        };
    
        fetchImages(); // Llamar al inicio
        const interval = setInterval(fetchImages, 5000); // Actualizar cada 5 segundos
    
        return () => clearInterval(interval); // Limpiar al desmontar
    
    }, []);

    const descripciones = {
        original: "Mantiene el tamaño original sin cambios.",
        escalado: "Ocupa toda la pantalla sin perder sus dimensiones.",
        fit: "Ajusta la imagen dentro del contenedor sin recortes.",
        outfit: "Ajusta la imagen llenando el contenedor, recortando si es necesario."
    };

    useEffect(() => { //Escalados
        const fetchEscalados = async () => {
            try {
                const response = await fetch("https://api.jaison.mx/raspi/api.php?action=obtenerescalados");

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                setEscalados(data);
            } catch (error) {
                console.error("Error al obtener los escalados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEscalados();
    }, []);

    useEffect(() => { //Dispositivos
        const fetchDevices = async () => {
            try {
                const response = await fetch("https://api.jaison.mx/raspi/api.php?action=obtenerdevices", {
                    mode: "cors",
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                setDevices(data);
            } catch (error) {
            }
        };

        fetchDevices();
    }, []);

    return (
        <div>
            <Navbar usuario={usuario} handleLogout={handleLogout} />
            <h1 className='container'>Listado</h1>
            <hr />
            <div className='container-fluid px-3'>

                {loading ? (
                    <p className='text-center'>Cargando...</p>
                ) : (
                    <div className='table-responsive'>
                        <table className='table table-striped table-hover text-center'>
                            <thead className='table-dark'>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagen/Video</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Hora Inicio</th>
                                    <th>Hora Fin</th>
                                    <th>Prioridad</th>
                                    <th>Escalado</th>
                                    <th>Device Name</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {imagenes.length > 0 ? (
                                    imagenes.map((imagen, index) => (
                                        <tr key={imagen.media_id}>
                                            <td>{imagen.rule_id}</td>
                                            <td onClick={() => setSelectedMedia({
                                                src: `https://api.jaison.mx/${imagen.src}`,
                                                type: imagen.src.endsWith('.mp4') ? 'video' : 'image'
                                            })}>
                                                {imagen.src.endsWith('.mp4') ? (
                                                    <video width='50'height='50'className='img-thumbnail'style={{ cursor: 'pointer' }}
                                                        ref={(video) => {
                                                            if (video) {
                                                                video.currentTime = 1;
                                                            }
                                                        }}
                                                    >
                                                        <source src={`https://api.jaison.mx/${imagen.src}`} type='video/mp4' />
                                                    </video>
                                                ) : (
                                                    <img
                                                        src={`https://api.jaison.mx/${imagen.src}`}
                                                        alt={`Imagen ${imagen.media_id}`}
                                                        className='img-thumbnail'
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                                                    />
                                                )}
                                            </td>
                                            {editIndex === index ? (
                                                <>
                                                    <td>
                                                        <DatePicker selected={fecha_inicio} onChange={handleFechaInicioChange} dateFormat='yyyy/MM/dd' className='custom-input2' locale='es' required />
                                                    </td>
                                                    <td>
                                                        <DatePicker selected={fecha_fin} onChange={(date) => setFechaFin(date)} dateFormat='yyyy/MM/dd' className='custom-input2' locale='es' required minDate={fecha_inicio} />
                                                    </td>
                                                    <td>
                                                        <input type='time' className='custom-input2' value={hora_inicio} onChange={handleHoraInicioChange} required />
                                                    </td>
                                                    <td>
                                                        <input type='time' className='custom-input2' value={hora_fin} onChange={(e) => setHoraFin(e.target.value)} min={hora_inicio} required />
                                                    </td>
                                                    <td>
                                                        <input className='custom-input2' type="number" name="prioridad" id="prioridad" min='1' max='10' value={editedData.prioridad} onChange={(e) => setEditedData({ ...editedData, prioridad: e.target.value })} required />
                                                    </td>
                                                    <td>
                                                        <select className="custom-input2" name="escalado" id="escalado" required>
                                                            {loading ? (
                                                                <option value='' disabled>Cargando escalados...</option>
                                                            ) : (
                                                                escalados.length > 0 ? (
                                                                    escalados.map((escalado, index) => (
                                                                        <option key={index} value={escalado} title={descripciones[escalado] || 'Sin descripción'}>
                                                                            {escalado}
                                                                        </option>
                                                                    ))
                                                                ) : (
                                                                    <option value='' disabled>No hay escalados disponibles</option>
                                                                )
                                                            )}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select className="custom-input2" name="id" id="id" required>
                                                            {devices.length > 0 ? (
                                                                devices.map((device) => (
                                                                    <option key={device.id} value={device.id}>{device.nombre}</option>
                                                                ))
                                                            ) : (
                                                                <option value='' disabled>Cargando dispositivos...</option>
                                                            )}
                                                        </select>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{imagen.fecha_inicio}</td>
                                                    <td>{imagen.fecha_fin}</td>
                                                    <td>{imagen.hora_inicio}</td>
                                                    <td>{imagen.hora_fin}</td>
                                                    <td>{imagen.prioridad}</td>
                                                    <td>{imagen.escalado}</td>
                                                    <td>{imagen.device_name}</td>
                                                </>
                                            )}
                                            <td>
                                                {editIndex === index ? (
                                                    <>
                                                        <button className='btn btn-success' onClick={handleSave}>Guardar</button>
                                                        <br />
                                                        <button className='btn btn-danger' onClick={handleCancel}>Cancelar</button>
                                                    </>
                                                ) : (
                                                    <button className='btn btn-secondary' onClick={() => handleEdit(index)}>Editar</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan='10' className='text-center'>No hay datos disponibles.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className='d-flex justify-content-center mt-3'>
                    <Link className='btn btn-primary' to='/Importar'>Regresar</Link>
                    
                </div>
                <br />
                {selectedMedia && (
                    <div className="modal" onClick={() => setSelectedMedia(null)}>
                        <div style={{ padding: "10px", borderRadius: "8px", position: "relative" }}>
                            <button onClick={() => setSelectedMedia(null)} className="delete-btn">✖</button>
                            {selectedMedia.type === "image" ? (
                                <img src={selectedMedia.src} alt="Vista previa" style={{ maxWidth: "90vw", maxHeight: "90vh" }} />
                            ) : (
                                <video src={selectedMedia.src} controls style={{ maxWidth: "90vw", maxHeight: "90vh" }} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Editar
