/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Link } from 'react-router-dom';
// import Graficas from './Graphs';
import Graficas2 from './Graphs2';
import Navbar from './Navbar';

const Home = ({ usuario }) => {
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

            {/* Contenido principal */}
            <div className="container mt-4">
                {usuario ? <p>¡Hola, <strong>{usuario.usuario}!</strong> Bienvenido </p> : <p>Inicia sesión para continuar.</p>}
            </div>
            <hr />
            <div className='container'>
                <Link className="btn btn-primary" to="/Importar">Importar imagen</Link>
            </div>
            <hr />
            {/* <Graficas className='container' /> */}
            <Graficas2 className='container' />
            <br />
            <hr />
            <br />
        </div>
    );
};

export default Home;
