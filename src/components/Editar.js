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
    const [nombre, setNombre] = useState([]);

    // Estado para el formulario de edición
    const [formData, setFormData] = useState({
        rule_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        hora_inicio: "00:00:00",
        hora_fin: "23:59:59",
        escalado: "",
        device: "",
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
                window.location.href = "/app1";
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

        // Actualizar estado del formulario
        setFormData({
            rule_id: mediaData.rule_id,
            fecha_inicio: mediaData.fecha_inicio,
            fecha_fin: mediaData.fecha_fin,
            hora_inicio: mediaData.hora_inicio,
            hora_fin: mediaData.hora_fin,
            escalado: mediaData.escalado,
            nombre: mediaData.nombre,
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
            nombre: "",
            x: "",
            y: ""
        });
    };

    // Manejador para guardar cambios
    const handleSave = async () => {
        try {
            // 1. Validación básica
            if (!formData.rule_id || !formData.fecha_inicio || !formData.fecha_fin) {
                alert("Faltan campos obligatorios");
                return;
            }

            // 2. Preparar payload
            const payload = {
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin,
                escalado: formData.escalado,
                nombre: nombre.find(d => d.id === formData.nombre)?.nombre || "",
                x: formData.x || null,
                y: formData.y || null
            };

            // 3. Enviar a la API
            const response = await fetch(
                `https://api.jaison.mx/raspi/api.php?action=editarimg&id=${formData.rule_id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(payload) // <- Solo los datos sin el ID
                }
            );

            if (!response.ok) {
                const errorData = await response.text(); // O response.json() si la API retorna JSON
                throw new Error(errorData || "Error en la respuesta del servidor");
            }

            const result = await response.json();
            console.log("Respuesta exitosa:", result);
            alert("¡Cambios guardados!");

        } catch (error) {
            console.error("Error completo:", {
                message: error.message,
                stack: error.stack,
                data: formData // Para ver qué se intentó enviar
            });
            alert(`Error al guardar: ${error.message}`);
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

    // Manejador para cambios en fechas
    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date.toISOString().split('T')[0]
        }));
    };

    // Efectos para carga inicial de datos
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Obtener imágenes
                const imagesResponse = await fetch('https://api.jaison.mx/raspi/api.php?action=listarImagenes');
                const imagesData = await imagesResponse.json();

                if (imagesData && Array.isArray(imagesData.data)) {
                    const imagesWithThumbnails = await Promise.all(
                        imagesData.data.map(async img => {
                            if (img.src.endsWith('.mp4')) {
                                const thumbnail = await getVideoThumbnail(img.src);
                                return { ...img, thumbnail };
                            }
                            return img;
                        })
                    );
                    setImagenes(imagesWithThumbnails);
                }

                // Obtener escalados
                const escaladosResponse = await fetch("https://api.jaison.mx/raspi/api.php?action=obtenerescalados");
                const escaladosData = await escaladosResponse.json();
                setEscalados(escaladosData);

                // Obtener dispositivos
                const nombresResponse = await fetch("https://api.jaison.mx/raspi/api.php?action=obtenerdevices", {
                    mode: "cors",
                });
                const nombresData = await nombresResponse.json();
                setNombre(nombresData);

            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData(); // Solo se ejecuta una vez al montar el componente

        // Eliminar estas líneas que establecían el intervalo:
        // const interval = setInterval(fetchInitialData, 5000);
        // return () => clearInterval(interval);

    }, []); // Asegúrate de que el array de dependencias esté vacío

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
                                                            className='custom-input2'
                                                            name="hora_inicio"
                                                            value={formData.hora_inicio}
                                                            onChange={handleInputChange}
                                                            
                                                            step="1"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type='time'
                                                            className='custom-input2'
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
                                                            name="nombre"
                                                            value={formData.nombre}
                                                            onChange={handleInputChange}
                                                            
                                                        >
                                                            <option value="">Seleccione...</option>
                                                            {nombre.map((nombre) => (
                                                                <option key={nombre.id} value={nombre.id}>
                                                                    {nombre.nombre}
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
                )}

                <div className='d-flex justify-content-center mt-3'>
                    <Link className='btn btn-primary' to='/Importar'>Regresar</Link>
                </div>

                {/* Modal para vista previa de medios */}
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
        </div>
    );
};

export default Editar;