import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

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

    useEffect(() => {
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
                    console.error('La propiedad "data" no es un array:', data);
                    setImagenes([]);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al obtener las imágenes:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <Navbar usuario={usuario} handleLogout={handleLogout} />
            <div className='container'>
                <div className="container mt-5">
                    <h1>Listado</h1>
                    <hr />
                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagen/Video</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Hora Inicio</th>
                                    <th>Hora Fin</th>
                                    <th>Prioridad</th>
                                    <th>Device Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {imagenes.length > 0 ? (
                                    imagenes.map((imagen) => (
                                        <tr key={imagen.media_id}>
                                            <td>{imagen.media_id}</td>
                                            <td>
                                                {imagen.src.endsWith('.mp4') ? (
                                                    <video
                                                        src={imagen.thumbnail}
                                                        alt={`Vista previa de video ${imagen.media_id}`}
                                                        style={{ width: '100px', height: 'auto', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://api.jaison.mx/${imagen.src}`}
                                                        alt={`Imagen ${imagen.media_id}`}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </td>
                                            <td>{imagen.fecha_inicio}</td>
                                            <td>{imagen.fecha_fin}</td>
                                            <td>{imagen.hora_inicio}</td>
                                            <td>{imagen.hora_fin}</td>
                                            <td>{imagen.prioridad}</td>
                                            <td>{imagen.device_name}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">No hay datos disponibles.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="button-container">
                    <Link className="btn btn-primary" to='/Importar'>Regresar</Link>
                </div>
            </div>
        </div>
    )
}

export default Editar
