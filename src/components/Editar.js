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
                    Authorization: `Bearer ${localStorage.getItem("token")}` // Si usas tokens
                }
            });

            const data = await response.text();
            console.log("Respuesta del servidor:", data);

            if (response.ok) {
                localStorage.removeItem("token");
                window.location.href = "/";
            } else {
                console.error("Error al cerrar sesión:", data);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
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
        device_id: "",
        device_name: "",
        x: "",
        y: ""
    });

    // Cargar datos (versión optimizada para mostrar datos pero compatible con tu handleSave)
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
    
            // Restauramos la versión original que funcionaba con handleSave
            const response = await fetch('https://api.jaison.mx/raspi/api.php?action=listarImagenes');
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Error al cargar imágenes");
            }
    
            // Procesamiento para mostrar imágenes (solo la parte visual)
            const imagenesProcesadas = data.data.map(img => ({
                ...img,
                src: img.src.startsWith('http') ? img.src : `https://api.jaison.mx/${img.src}`
            }));
    
            // Obtenemos escalados y dispositivos (esto puede mantenerse igual)
            const [escaladosRes, dispositivosRes] = await Promise.all([
                fetch('https://api.jaison.mx/raspi/api.php?action=obtenerescalados'),
                fetch("https://api.jaison.mx/raspi/api.php?action=obtenerdevices")
            ]);
    
            const [escaladosData, dispositivosData] = await Promise.all([
                escaladosRes.json(),
                dispositivosRes.json()
            ]);
    
            setImagenes(imagenesProcesadas);
            setEscalados(escaladosData || []);
            setDispositivos(dispositivosData || []);
    
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setError("Error al cargar datos. Intenta recargar la página.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Manejador para editar registro (ORIGINAL)
    const handleEdit = async (index) => {
        const imagenSeleccionada = imagenes[index];
        
        // Buscar el dispositivo correspondiente
        const dispositivo = dispositivos.find(d => d.nombre === imagenSeleccionada.device_name);

        setFormData({
            rule_id: imagenSeleccionada.rule_id,
            fecha_inicio: imagenSeleccionada.fecha_inicio,
            fecha_fin: imagenSeleccionada.fecha_fin,
            hora_inicio: imagenSeleccionada.hora_inicio,
            hora_fin: imagenSeleccionada.hora_fin,
            escalado: imagenSeleccionada.escalado,
            device_id: dispositivo?.id || "",
            device_name: imagenSeleccionada.device_name || "",
            x: imagenSeleccionada.x || "",
            y: imagenSeleccionada.y || ""
        });

        setEditIndex(index);
    };

    // Manejador para guardar cambios (TU VERSIÓN ORIGINAL QUE FUNCIONABA)
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
    
            // Crear URLSearchParams para enviar los datos
            const params = new URLSearchParams();
            params.append('fecha_inicio', formData.fecha_inicio);
            params.append('fecha_fin', formData.fecha_fin);
            params.append('hora_inicio', formData.hora_inicio);
            params.append('hora_fin', formData.hora_fin);
            params.append('escalado', formData.escalado);
            params.append('nombre', formData.device_id);
            params.append('x', formData.x);
            params.append('y', formData.y);
    
            // URL completa para debugging
            const url = `https://api.jaison.mx/raspi/api.php?action=editarimg&id=${formData.rule_id}`;
            console.log("URL de la petición:", url);
    
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error en la respuesta del servidor");
            }
    
            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
    
            // Actualizar el estado local
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
            console.error("Error completo al guardar:", error);
            alert(`Error al guardar: ${error.message}`);
        }
    };

    // Resto de tus manejadores originales
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeviceChange = (selectedDeviceId) => {
        const dispositivoSeleccionado = dispositivos.find(d => d.id === selectedDeviceId);
        setFormData(prev => ({
            ...prev,
            device_id: selectedDeviceId,
            device_name: dispositivoSeleccionado?.nombre || ""
        }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date.toISOString().split('T')[0]
        }));
    };


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
                                    <th>Escalado</th>
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
                                                src: imagen.src,
                                                type: imagen.src.endsWith('.mp4') ? 'video' : 'image'
                                            })}>
                                                {imagen.src.endsWith('.mp4') ? (
                                                    <video width='50' height='50' className='img-thumbnail' style={{ cursor: 'pointer' }}>
                                                        <source src={imagen.src} type='video/mp4' />
                                                    </video>
                                                ) : (
                                                    <img
                                                        src={imagen.src}
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