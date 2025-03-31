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
    // Estados principales
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [escalados, setEscalados] = useState([]);
    const [dispositivos, setDispositivos] = useState([]);
    const [error, setError] = useState(null);

    // Estado para el formulario de edición
    const [formData, setFormData] = useState({
        rule_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        hora_inicio: "00:00:00",
        hora_fin: "23:59:59",
        escalado: "",
        device_name: "", // Asegúrate de tener este campo para el nombre
        x: "",
        y: ""
    });

    // Manejador de logout
    const handleLogout = async () => {
        try {
            const response = await fetch("https://api.jaison.mx/Analisis_Perros/index.php?action=logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                localStorage.removeItem("token");
                window.location.href = "/";
            } else {
                console.error("Error al cerrar sesión:", await response.text());
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
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

        // Cargar thumbnail si es video
        let mediaData = { ...imagenSeleccionada };
        if (imagenSeleccionada.src.endsWith('.mp4') && !imagenSeleccionada.thumbnail) {
            mediaData.thumbnail = await getVideoThumbnail(imagenSeleccionada.src);
        }

        // Buscar el dispositivo correspondiente
        const dispositivo = dispositivos.find(d => d.nombre === mediaData.device_name);

        // Actualizar estado del formulario
        setFormData({
            rule_id: mediaData.rule_id,
            fecha_inicio: mediaData.fecha_inicio,
            fecha_fin: mediaData.fecha_fin,
            hora_inicio: mediaData.hora_inicio,
            hora_fin: mediaData.hora_fin,
            escalado: mediaData.escalado,
            device_id: dispositivo?.id || "",
            device_name: mediaData.device_name || "",
            x: mediaData.x || "",
            y: mediaData.y || ""
        });

        setEditIndex(index);
    };

    // Manejador para cancelar edición
    const handleCancelEdit = () => {
        setEditIndex(null);
        setFormData({
            rule_id: "",
            fecha_inicio: "",
            fecha_fin: "",
            hora_inicio: "00:00:00",
            hora_fin: "23:59:59",
            escalado: "",
            device_id: "",
            device_name: "",
            x: "",
            y: ""
        });
    };

    // Manejador para guardar cambios
    // Manejador para guardar cambios - Versión corregida
    const handleSave = async () => {
        try {
            // Validación de campos requeridos
            const requiredFields = {
                'ID de regla': formData.rule_id,
                'Fecha inicio': formData.fecha_inicio,
                'Fecha fin': formData.fecha_fin,
                'Escalado': formData.escalado,
                'Dispositivo': formData.device_id,
                'Coordenada X': formData.x,
                'Coordenada Y': formData.y
            };

            for (const [field, value] of Object.entries(requiredFields)) {
                if (!value && value !== 0) {
                    throw new Error(`El campo ${field} es obligatorio`);
                }
            }

            // Preparar datos para enviar
            const formDataToSend = new FormData();
            formDataToSend.append('fecha_inicio', formData.fecha_inicio);
            formDataToSend.append('fecha_fin', formData.fecha_fin);
            formDataToSend.append('hora_inicio', formData.hora_inicio);
            formDataToSend.append('hora_fin', formData.hora_fin);
            formDataToSend.append('escalado', formData.escalado);
            formDataToSend.append('nombre', formData.device_id);
            formDataToSend.append('x', formData.x);
            formDataToSend.append('y', formData.y);

            // Enviar al backend
            const response = await fetch(
                `https://api.jaison.mx/raspi/api.php?action=editarimg&id=${formData.rule_id}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: formDataToSend
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            // Actualizar el estado local con los nuevos datos
            const dispositivoActualizado = dispositivos.find(d => d.id === formData.device_id);

            setImagenes(prev => prev.map((img, idx) =>
                idx === editIndex ? {
                    ...img,
                    fecha_inicio: formData.fecha_inicio,
                    fecha_fin: formData.fecha_fin,
                    hora_inicio: formData.hora_inicio,
                    hora_fin: formData.hora_fin,
                    escalado: formData.escalado,
                    device_id: formData.device_id,
                    device_name: dispositivoActualizado?.nombre || img.device_name,
                    x: formData.x,
                    y: formData.y
                } : img
            ));

            // Cerrar edición y mostrar mensaje
            handleCancelEdit();
            alert(result.mensaje || "¡Cambios guardados correctamente!");

        } catch (error) {
            console.error("Error al guardar:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // Manejador genérico para cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejador para cambios en dispositivos
    const handleDeviceChange = (selectedDeviceId) => {
        const dispositivoSeleccionado = dispositivos.find(d => d.id === selectedDeviceId);
        setFormData(prev => ({
            ...prev,
            device_id: selectedDeviceId,
            device_name: dispositivoSeleccionado?.nombre || ""
        }));
    };

    // Manejador para cambios en fechas
    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date.toISOString().split('T')[0]
        }));
    };

    const LoadingSpinner = () => (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando datos...</p>
        </div>
    );

    const ErrorMessage = ({ error, onRetry }) => (
        <div className="alert alert-danger mt-5 container">
            {error}
            <button className="btn btn-secondary ms-3" onClick={onRetry}>
                Reintentar
            </button>
        </div>
    );


    // Efectos para carga inicial de datos
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
    
                // Realizar todas las peticiones en paralelo
                const [imagesResponse, escaladosResponse, dispositivosResponse] = await Promise.all([
                    fetch('https://api.jaison.mx/raspi/api.php?action=listarImagenes'),
                    fetch('https://api.jaison.mx/raspi/api.php?action=obtenerescalados'),
                    fetch("https://api.jaison.mx/raspi/api.php?action=obtenerdevices")
                ]);
    
                // Verificar si las respuestas de las APIs son exitosas
                if (!imagesResponse.ok) throw new Error(`Error al cargar imágenes: ${imagesResponse.status}`);
                if (!escaladosResponse.ok) throw new Error(`Error al cargar escalados: ${escaladosResponse.status}`);
                if (!dispositivosResponse.ok) throw new Error(`Error al cargar dispositivos: ${dispositivosResponse.status}`);
    
                // Parsear las respuestas JSON
                const [imagesData, escaladosData, dispositivosData] = await Promise.all([
                    imagesResponse.json(),
                    escaladosResponse.json(),
                    dispositivosResponse.json()
                ]);
    
                // Verificar el formato de los datos de las imágenes
                if (!imagesData.data || !Array.isArray(imagesData.data)) {
                    throw new Error("Formato de datos de imágenes inválido");
                }
    
                // Agregar las miniaturas a las imágenes con extensión .mp4
                const imagesWithThumbnails = await Promise.all(
                    imagesData.data.map(async img => {
                        if (img.src && img.src.endsWith('.mp4')) {
                            try {
                                const thumbnail = await getVideoThumbnail(img.src);
                                return { ...img, thumbnail };
                            } catch (e) {
                                console.error("Error generando thumbnail:", e);
                                return img;
                            }
                        }
                        return img;
                    })
                );
    
                // Guardar los datos en el estado
                setImagenes(imagesWithThumbnails);
                setEscalados(escaladosData || []);
                setDispositivos((dispositivosData || []).map(({ id, nombre }) => ({ id, nombre })));
    
            } catch (error) {
                // Mostrar el error si algo falla
                console.error("Error al cargar datos:", error);
                setError(`Error al cargar datos: ${error.message}`);
                setImagenes([]); // Limpiar las imágenes en caso de error
            } finally {
                setLoading(false); // Finalizar la carga
            }
        };
    
        fetchInitialData(); // Llamada inicial
    }, []); // Solo ejecutarse una vez al montar el componente
    

    return (
        
        <div>
            <Navbar usuario={usuario} handleLogout={handleLogout} />
            <h1 className='container'>Listado</h1>
            <hr />
            <div className='container'>
                <Link className="btn btn-primary" to='/Importar'>Añadir</Link>
            </div>
            <hr />
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorMessage
                    error={error}
                    onRetry={() => window.location.reload()}
                />
            ) : (
                <div className='container-fluid px-3'>
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
                                                    <video width='50' height='50' className='img-thumbnail' style={{ cursor: 'pointer' }}>
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
                                                            selected={formData.fecha_inicio ? new Date(formData.fecha_inicio) : null}
                                                            onChange={(date) => handleDateChange(date, 'fecha_inicio')}
                                                            dateFormat='yyyy/MM/dd'
                                                            className='custom-input2'
                                                            locale='es'

                                                        />
                                                    </td>
                                                    <td>
                                                        <DatePicker
                                                            selected={formData.fecha_fin ? new Date(formData.fecha_fin) : null}
                                                            onChange={(date) => handleDateChange(date, 'fecha_fin')}
                                                            dateFormat='yyyy/MM/dd'
                                                            className='custom-input2'
                                                            locale='es'

                                                            minDate={new Date(formData.fecha_inicio)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='time'
                                                            className='custom-input2 react-datepicker-ignore-onclickoutside'
                                                            name="hora_inicio"
                                                            value={formData.hora_inicio}
                                                            onChange={handleInputChange}

                                                            step="1"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='time'
                                                            className='custom-input2 react-datepicker-ignore-onclickoutside'
                                                            name="hora_fin"
                                                            value={formData.hora_fin}
                                                            onChange={handleInputChange}
                                                            min={formData.hora_inicio}

                                                            step="1"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            id='prioridad'
                                                            className='custom-input2'
                                                            name="x"
                                                            value={formData.x}
                                                            onChange={handleInputChange}

                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='number'
                                                            className='custom-input2'
                                                            id='prioridad'
                                                            name="y"
                                                            value={formData.y}
                                                            onChange={handleInputChange}

                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            className='custom-input2'
                                                            name="escalado"
                                                            value={formData.escalado}
                                                            onChange={handleInputChange}
                                                            id='prioridad'
                                                        >
                                                            <option value="">Seleccione...</option>
                                                            {escalados.map((escalado, idx) => (
                                                                <option key={idx} value={escalado}>
                                                                    {escalado}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className='custom-input2'
                                                            id='prioridad'
                                                            value={formData.device_id}
                                                            onChange={(e) => handleDeviceChange(e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Seleccione dispositivo...</option>
                                                            {dispositivos.map(device => (
                                                                <option key={device.id} value={device.id}>
                                                                    {device.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button className='btn btn-success me-2' onClick={handleSave}>
                                                            Guardar
                                                        </button>
                                                        <button className='btn btn-danger' onClick={handleCancelEdit}>
                                                            Cancelar
                                                        </button>
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
                                                    <td>
                                                        <button
                                                            onClick={() => handleEdit(index)}
                                                            className='btn btn-secondary'
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan='11' className='text-center'>No hay datos disponibles.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex justify-content-center mt-3'>
                        <Link className='btn btn-primary' to='/Importar'>Regresar</Link>
                    </div>

                    {selectedMedia && (
                        <div className="modal" onClick={() => setSelectedMedia(null)}>
                            <div style={{ padding: "10px", borderRadius: "8px", position: "relative" }}>
                                <button
                                    onClick={() => setSelectedMedia(null)}
                                    className="btn btn-danger position-absolute top-0 end-0 m-2"
                                >
                                    ✖
                                </button>
                                {selectedMedia.type === "image" ? (
                                    <img
                                        src={selectedMedia.src}
                                        alt="Vista previa"
                                        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                                    />
                                ) : (
                                    <video
                                        src={selectedMedia.src}
                                        controls
                                        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                                        autoPlay
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Editar;