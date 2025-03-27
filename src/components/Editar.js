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
    const [editedData, setEditedData] = useState({
        rule_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        hora_inicio: "",
        hora_fin: "",
        escalado: "",
        device: "",
        x: "",
        y: ""
    });
    const [fecha_inicio, setFechaInicio] = useState(null);
    const [fecha_fin, setFechaFin] = useState(null);
    const [hora_inicio, setHoraInicio] = useState("");
    const [hora_fin, setHoraFin] = useState("");
    const [escalados, setEscalados] = useState([]);
    const [devices, setDevices] = useState([]);

    // Manejadores de fechas/horas
    const handleFechaInicioChange = (date) => {
        setFechaInicio(date);
        setEditedData(prev => ({
            ...prev,
            fecha_inicio: date.toISOString().split('T')[0]
        }));
    };

    const handleFechaFinChange = (date) => {
        setFechaFin(date);
        setEditedData(prev => ({
            ...prev,
            fecha_fin: date.toISOString().split('T')[0]
        }));
    };

    const handleHoraInicioChange = (e) => {
        const value = e.target.value;
        setHoraInicio(value);
        setEditedData(prev => ({
            ...prev,
            hora_inicio: value
        }));
    };

    const handleHoraFinChange = (e) => {
        const value = e.target.value;
        setHoraFin(value);
        setEditedData(prev => ({
            ...prev,
            hora_fin: value
        }));
    };

    // Manejador de cambios genérico
    const handleChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Manejador para seleccionar dispositivo
    const handleDeviceChange = (e) => {
        handleChange('device', e.target.value);
    };

    // Thumbnail para videos
    const getVideoThumbnail = (videoSrc) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = `https://api.jaison.mx/${videoSrc}`;
            video.crossOrigin = "anonymous";
            video.addEventListener('loadeddata', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                resolve(canvas.toDataURL());
            });
            video.load();
        });
    };

    // Manejador para editar registro
    const handleEdit = async (index) => {
        const imagenSeleccionada = imagenes[index];
        setEditIndex(index);

        // Cargar thumbnail si es video
        let mediaData = { ...imagenSeleccionada };
        if (imagenSeleccionada.src.endsWith('.mp4') && !imagenSeleccionada.thumbnail) {
            mediaData.thumbnail = await getVideoThumbnail(imagenSeleccionada.src);
        }

        // Actualizar todos los estados
        setEditedData(mediaData);
        setFechaInicio(new Date(mediaData.fecha_inicio));
        setFechaFin(new Date(mediaData.fecha_fin));
        setHoraInicio(mediaData.hora_inicio);
        setHoraFin(mediaData.hora_fin);
    };

    // Manejador para cancelar edición
    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({
            rule_id: "",
            fecha_inicio: "",
            fecha_fin: "",
            hora_inicio: "",
            hora_fin: "",
            escalado: "",
            device: "",
            x: "",
            y: ""
        });
    };

    // Manejador para guardar cambios (Versión mejorada)
    const handleSave = async () => {
        try {
            // Validaciones básicas
            if (editIndex === null || !editedData.rule_id) {
                alert("Error: No hay elemento seleccionado para editar");
                return;
            }

            // Preparar datos para enviar
            const payload = {
                rule_id: editedData.rule_id,
                fecha_inicio: fecha_inicio.toISOString().split('T')[0],
                fecha_fin: fecha_fin.toISOString().split('T')[0],
                hora_inicio: hora_inicio,
                hora_fin: hora_fin,
                escalado: editedData.escalado,
                device: editedData.device,
                x: editedData.x || null,
                y: editedData.y || null
            };

            // Enviar a la API
            const response = await fetch(
                `https://api.jaison.mx/raspi/api.php?action=editarimg&id=${editedData.rule_id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Error al guardar los cambios");
            }

            // Actualizar estado local
            const updatedImagenes = [...imagenes];
            updatedImagenes[editIndex] = { ...updatedImagenes[editIndex], ...payload };
            setImagenes(updatedImagenes);

            // Resetear estados
            handleCancel();
            alert("Cambios guardados exitosamente!");

        } catch (error) {
            console.error("Error en handleSave:", error);
            alert(`Error al guardar: ${error.message}`);
        }
    };

    // Efectos para carga inicial
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
            <div className='container'>
                <Link className="btn btn-primary" to='/Editar'>Añadir</Link>
            </div>
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
                                    <th>Fecha de inicio</th>
                                    <th>Fecha de finalización</th>
                                    <th>Hora de inicio</th>
                                    <th>Hora de finalización</th>
                                    <th>Eje X</th>
                                    <th>Eje Y</th>
                                    <th>Tamaño</th>
                                    <th>Dispositivo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {imagenes.length > 0 ? (
                                    imagenes.map((imagen, index) => (
                                        <tr key={imagen.rule_id}>
                                            <td>{imagen.rule_id}</td>
                                            <td onClick={() => setSelectedMedia({
                                                src: `https://api.jaison.mx/${imagen.src}`,
                                                type: imagen.src.endsWith('.mp4') ? 'video' : 'image'
                                            })}>
                                                {imagen.src.endsWith('.mp4') ? (
                                                    <video width='50' height='50' className='img-thumbnail' style={{ cursor: 'pointer' }}
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
                                                        <DatePicker
                                                            selected={fecha_inicio}
                                                            onChange={handleFechaInicioChange}
                                                            dateFormat='yyyy/MM/dd'
                                                            className='custom-input2'
                                                            locale='es'
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <DatePicker
                                                            selected={fecha_fin}
                                                            onChange={handleFechaFinChange}
                                                            dateFormat='yyyy/MM/dd'
                                                            className='custom-input2'
                                                            locale='es'
                                                            required
                                                            minDate={fecha_inicio}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='time'
                                                            className='custom-input2'
                                                            value={hora_inicio}
                                                            onChange={handleHoraInicioChange}
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='time'
                                                            className='custom-input2'
                                                            value={hora_fin}
                                                            onChange={handleHoraFinChange}
                                                            min={hora_inicio}
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            className='custom-input2'
                                                            value={editedData.x || ""}
                                                            onChange={(e) => handleChange("x", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            className='custom-input2'
                                                            value={editedData.y || ""}
                                                            onChange={(e) => handleChange("y", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="custom-input2"
                                                            name="escalado"
                                                            id="escalado"
                                                            value={editedData.escalado || ''}
                                                            onChange={(e) => setEditedData({ ...editedData, escalado: e.target.value })}
                                                            required
                                                        >
                                                            {escalados.map((escalado, index) => (
                                                                <option key={index} value={escalado}>
                                                                    {escalado}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="custom-input2"
                                                            name="device"
                                                            id="device"
                                                            value={editedData.device || ''}
                                                            onChange={handleDeviceChange}
                                                            required
                                                        >
                                                            {devices.length > 0 ? (
                                                                devices.map((device) => (
                                                                    <option key={device.id} value={device.id}>
                                                                        {device.nombre}
                                                                    </option>
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
                                                    <td>{imagen.x}</td>
                                                    <td>{imagen.y}</td>
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
                                                    <>
                                                        <button onClick={() => handleEdit(index)} className='btn btn-secondary'>Editar</button>
                                                    </>
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