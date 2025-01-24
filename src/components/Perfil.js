/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import appFirebase from '../credenciales';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const auth = getAuth(appFirebase);
const firestore = getFirestore(appFirebase);

const Perfil = ({ correoUsuario }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuario, setUsuario] = useState({});
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
    });

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const docuRef = doc(firestore, `usuarios/${user.uid}`);
                    const docuSnap = await getDoc(docuRef);
                    if (docuSnap.exists()) {
                        setUsuario(docuSnap.data());
                        setFormData(docuSnap.data());
                        const { nombre } = docuSnap.data();
                        setNombreUsuario(nombre);
                    } else {
                        console.error('El documento no existe');
                    }
                }
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                const docuRef = doc(firestore, `usuarios/${user.uid}`);
                await updateDoc(docuRef, formData);
                setUsuario(formData);
                setEditando(false);
                alert('Datos actualizados correctamente');
            }
        } catch (error) {
            console.error('Error al actualizar los datos:', error);
            alert('Hubo un error al actualizar los datos');
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to='/'>Dashboard</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                </div>
            </nav>

            <div className="container mt-5 p-4 shadow-sm rounded bg-light">
                <h1 className="perfil-usuario">Perfil del Usuario</h1>
                
                {!editando ? (
                    <div className="text">
                        <p className="fs-5">
                            <strong>Nombre:</strong> {usuario.nombre}
                        </p>
                        <p className="fs-5">
                            <strong>Apellido:</strong> {usuario.apellidos}
                        </p>
                        <hr />
                        <p className="fs-5">
                            <strong>Correo:</strong> {usuario.correo}
                        </p>
                        <hr />
                        <button className="btn btn-primary mt-3" onClick={() => setEditando(true)}>Editar perfil</button>
                    </div>
                ) : (
                    <form className="mt-3">
                        <div className="mb-3">
                            <label className="form-label fw-bold text-secondary">Nombre</label>
                            <input type="text" className="form-control shadow-sm" name="nombre" value={formData.nombre} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold text-secondary">Apellido</label>
                            <input type="text" className="form-control shadow-sm" name="apellidos" value={formData.apellidos} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold text-secondary">Correo</label>
                            <input type="email" className="form-control shadow-sm" name="correo" value={formData.correo} onChange={handleChange} disabled />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success shadow-sm" onClick={handleGuardar}>Guardar cambios</button>
                            <button className="btn btn-secondary shadow-sm ms-2" onClick={() => setEditando(false)}>Cancelar</button>
                        </div>
                    </form>
                )}
                <div className="text-center mt-4">
                    <Link className="btn btn-outline-primary" to="/">Regresar</Link>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
