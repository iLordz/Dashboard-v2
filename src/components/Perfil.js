/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Perfil = ({ usuario }) => {
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


    return (
        <div>
            <Navbar usuario={usuario} handleLogout={handleLogout} />

            <div className="container mt-5 p-4 shadow-sm rounded bg-light">
                <h1 className="perfil-usuario">Configurarción</h1>
                <h2 className=''>Perfíl</h2>
                <hr></hr>
                <form className="mt-3">
                    <div className="mb-3">
                        <label className="form-label fw-bold text-secondary">Nombre</label>
                        <p>{usuario.usuario}</p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold text-secondary">Correo</label>
                        <p>{usuario.correo}</p>
                    </div>

                </form>
                <div className="text-center mt-4">
                    <Link className="btn btn-primary" to="/">Regresar</Link>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
