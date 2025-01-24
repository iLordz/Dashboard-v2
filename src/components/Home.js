/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import appFirebase from '../credenciales';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Graficas from './Graphs';

const auth = getAuth(appFirebase);
const firestore = getFirestore(appFirebase);

const Home = ({ correoUsuario }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const docuRef = doc(firestore, `usuarios/${user.uid}`);
                    const docuSnap = await getDoc(docuRef);
                    if (docuSnap.exists()) {
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

    return (
        <div>
            {/* Encabezado*/}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to='/'>Dashboard</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">{nombreUsuario || 'Usuario'}</a>
                                <ul className="dropdown-menu mi-dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                    <li>
                                        <Link className="dropdown-item" to='/perfil'>
                                            <i className="fas fa-user mi-dropdown-item-icon"></i> Ver perfil
                                        </Link>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" onClick={() => signOut(auth)}>
                                            <i className="fas fa-sign-out-alt mi-dropdown-item-icon"></i> Cerrar sesión
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <div className="container mt-4">
                <p>Bienvenido <strong>{nombreUsuario || correoUsuario}</strong>, haz iniciado sesión.</p>
            </div>
            <hr />

            <Graficas />
        </div>
    );
};

export default Home;
