/* eslint-disable no-template-curly-in-string */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';

registerLocale('es', es);
setDefaultLocale('es');

const Importe = ({ usuario }) => {
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
                window.location.href = "/app1";
            } else {
                console.error("Error al cerrar sesión:", data);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [alerta, setAlerta] = useState({ visible: false, mensaje: "", tipo: "" });
    const [fecha_inicio, setFechaInicio] = useState("");
    const [fecha_fin, setFechaFin] = useState("");
    const [hora_inicio, setHoraInicio] = useState("");
    const [hora_fin, setHoraFin] = useState("");
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const mostrarAlerta = (mensaje, tipo) => {
        setAlerta({ visible: true, mensaje, tipo });
        setTimeout(() => {
            setAlerta({ visible: false, mensaje: "", tipo: "" });
        }, 3000);
    };

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

    // const handleTestModal = () => {
    //     setLoading(true);
    //     setTimeout(() => setLoading(false), 3000);
    // };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!imagen || !fecha_inicio || !fecha_fin || !hora_inicio || !hora_fin || !document.getElementById("id").value || !document.getElementById("prioridad").value) {
            mostrarAlerta("Por favor selecciona una imagen y completa todos los campos.", "error");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000);

        const formData = new FormData();
        formData.append("imagen", imagen);
        formData.append("fecha_inicio", fecha_inicio.toISOString().split('T')[0]);
        formData.append("fecha_fin", fecha_fin.toISOString().split('T')[0]);
        formData.append("hora_inicio", hora_inicio);
        formData.append("hora_fin", hora_fin);
        formData.append("id", document.getElementById("id").value);
        formData.append("prioridad", document.getElementById("prioridad").value);

        try {
            const response = await fetch("https://api.jaison.mx/raspi/api.php?action=subirimg", {
                method: "POST",
                body: formData,
            });

            const responseText = await response.text();
            console.log("Respuesta del servidor:", responseText);
            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                data = responseText;
            }

            if (response.ok) {
                mostrarAlerta("Archivo subido exitosamente.", "success");
            } else {
                mostrarAlerta(`⚠️ Error en la subida: ${data?.message || responseText}`, "success");
            }

            setImagen(null);
            setPreview(null);
            setFechaInicio("");
            setFechaFin("");
            setHoraInicio("");
            setHoraFin("");
            document.getElementById("id").value = "";
            document.getElementById("prioridad").value = "";

        } catch (error) {
            mostrarAlerta("Subida de datos exitosamente.", "success");

            setImagen(null);
            setPreview(null);
            setFechaInicio("");
            setFechaFin("");
            setHoraInicio("");
            setHoraFin("");
            document.getElementById("id").value = "";
            document.getElementById("prioridad").value = "";
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
            {/* <button onClick={handleTestModal} className="test-btn">Probar Modal</button> */}
            {loading && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="spinner"></div>
                        <p>Subiendo archivo...</p>
                    </div>
                </div>
            )}

            <div className='container'>
                {alerta.visible && (
                    <div className={`alerta ${alerta.tipo}`}>
                        {alerta.mensaje}
                    </div>
                )}

                <div className={`upload-area ${dragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <h3 className="upload-text">Puedes arrastrar y soltar una imagen o video, o seleccionarlo desde tu dispositivo.</h3>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="imageUpload" className="upload-btn" x>Seleccionar archivo</label>
                        <br />

                        {imagen && <p className="file-name">Archivo seleccionado: {imagen.name}</p>}

                        {preview && (
                            <div className="preview-container">
                                <button className="delete-btn" onClick={() => {
                                    setImagen(null);
                                    setPreview(null);
                                }}>✖</button>

                                {imagen.type.startsWith("image/") ? (
                                    <img src={preview} alt="Vista previa" className="preview-image" />
                                ) : imagen.type.startsWith("video/") ? (
                                    <div className="video-container">
                                        <video controls className="preview-video">
                                            <source src={preview} type={imagen.type} />
                                            Tu navegador no soporta la reproducción de videos.
                                        </video>
                                    </div>
                                ) : null}
                            </div>
                        )}
                        <br />
                        <input type="file" id="imageUpload" onChange={handleImageChange} required />

                        <div className="form-container">
                            <div className="form-group">
                                <label className='fechainicio'>Fecha de inicio</label>
                                <DatePicker selected={fecha_inicio} onChange={handleFechaInicioChange} dateFormat="yyyy/MM/dd" className="custom-input" locale="es" required />
                            </div>

                            <div className="form-group">
                                <label className='fechafin'>Fecha de finalización</label>
                                <DatePicker selected={fecha_fin} onChange={(date) => setFechaFin(date)} dateFormat="yyyy/MM/dd" className="custom-input" locale="es" required minDate={fecha_inicio} />
                            </div>

                            <div className="form-group">
                                <label className='fechafin'>Hora de inicio</label>
                                <input type="time" className='custom-input' id='hora_inicio' name='hora_inicio' value={hora_inicio} onChange={handleHoraInicioChange} required />
                            </div>

                            <div className="form-group">
                                <label className='fechafin'>Hora de finalización</label>
                                <input type="time" className='custom-input' id='hora_fin' name='hora_fin' value={hora_fin} onChange={(e) => setHoraFin(e.target.value)} min={hora_inicio} required />
                            </div>

                            <div className="form-group">
                                <label className="fechafin">Elige un dispositivo</label>
                                <select className="custom-input" name="id" id="id" required>
                                    <option value="" disabled>Selecciona un dispositivo</option>
                                    {devices.length > 0 ? (
                                        devices.map((device) => (
                                            <option key={device.id} value={device.id}>{device.nombre}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Cargando dispositivos...</option>
                                    )}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="prioridad" className='fechafin'>Prioridad</label>
                                <input className='custom-input' type="number" name="prioridad" id="prioridad" min="1" max="10" required />
                            </div>

                            <div className="form-group">
                                <label className="fechafin">Tamaño</label>
                                <select className="custom-input" name="id" id="id" required>
                                    <option value="" disabled>Selecciona el tamaño del archivo</option>
                                    {devices.length > 0 ? (
                                        devices.map((device) => (
                                            <option key={device.id} value={device.id}>{device.nombre}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Cargando dispositivos...</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <br />

                        <button type="submit" className="upload-btn">Subir</button>
                    </form>
                </div>

                <div className='container'>
                    <Link className="btn btn-primary" to='/'>Regresar</Link>
                </div>
                <br />
            </div>
        </div>
    );
};

export default Importe;
