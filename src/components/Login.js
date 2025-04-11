import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import Uno from '../images/1.jpg'
import Dos from '../images/2.png'
import Tres from '../images/3.png'
import Cuatro from '../images/4.png'
import Cinco from '../images/5.png'

const Login = ({ setUsuario }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [registro, setRegistro] = useState(false);
    const [nombreDisponible, setNombreDisponible] = useState(true);
    const navigate = useNavigate();

    const verificarUsuario = async (usuario) => {
        try {
            const response = await fetch(`https://api.jaison.mx/Analisis_Perros/index.php?action=verificarUsuario&usuario=${usuario}`);
            const data = await response.json();
            console.log("Respuesta del servidor:", data);
            setNombreDisponible(!data.existe);
        } catch (error) {
        }
    };

    const handlerSubmit = async (e) => {
        e.preventDefault();
        const contrasena = e.target.contrasena.value;
        const correo = e.target.email.value;

        if (registro) {
            const usuario = e.target.usuario.value;

            // Verificar si el usuario ya existe antes de registrarlo
            await verificarUsuario(usuario);
            if (!nombreDisponible) {
                alert('El nombre de usuario ya está en uso, elige otro.');
                return;
            }

            try {
                const response = await fetch('https://api.jaison.mx/Analisis_Perros/index.php?action=crearUsuario', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, correo, contrasena }),
                    mode: "cors"
                });

                const data = await response.json();

                if (data.success) {
                    alert('Usuario registrado con éxito');
                    setRegistro(false);
                    navigate('/');
                } else {
                    alert('Error al registrar: ' + data.message);
                }
            } catch (error) {
            }
        } else {


            try {
                const response = await fetch('https://api.jaison.mx/Analisis_Perros/index.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, contrasena })  // Usamos correoUsuario
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token_sesion);
                    setUsuario({ correo, usuario: data.usuario });
                    navigate('/');
                } else {
                    alert('Correo o contraseña incorrectos');
                }
            } catch (error) {
            }
        }
    };

    return (
        <div className='container d-flex justify-content-center align-items-center p-4'>
            <div className='row w-100'>
                <div className='col-md-4'>
                    <div className='mt-5 p-4 border rounded shadow-lg'>
                        <h1 className='text-center mb-4'>{registro ? 'Regístrate' : 'Inicia sesión'}</h1>
                        <form onSubmit={handlerSubmit} >
                            {registro && (
                                <>
                                    <div className='mb-3'>
                                        <label className='form-label'>Nombre:</label>
                                        <input type='text' className='form-control' placeholder='Ingresa tu nombre' id='usuario' required
                                            onBlur={(e) => verificarUsuario(e.target.value)}
                                        />
                                        {!nombreDisponible && (
                                            <small className="text-danger">El nombre ya está en uso.</small>
                                        )}
                                    </div>
                                </>
                            )}
                            <div className='mb-3'>
                                <label className='form-label'>Correo electrónico:</label>
                                <input type='email' className='form-control' placeholder='Ingresa tu correo' id='email' required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Contraseña:</label>
                                <div className="d-flex align-items-center border rounded">
                                    <input type={showPassword ? "text" : "password"} className="form-control border-0" placeholder="Ingresa tu contraseña" id="contrasena" required />
                                    <button type="button" className="btn-pass px-2" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                </div>
                            </div>
                            <div className='d-grid gap-2'>
                                <button className='btn btn-primary' type="submit">
                                    {registro ? 'Regístrate' : 'Inicia sesión'}
                                </button>
                            </div>
                        </form>
                        <div className='text-center mt-3'>
                            <button className='btn btn-link' onClick={() => setRegistro(!registro)}>
                                {registro ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
                            </button>
                        </div>
                    </div>
                </div>

                <br></br>

                {/* Carrusel */}
                <div className='col-md-8'>
                    <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="3" aria-label="Slide 4"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="4" aria-label="Slide 5"></button>
                        </div>
                        <div className="carousel-inner">
                            <div className="carousel-item active" data-bs-interval="5000">
                                <img src={Cuatro} alt='' className='carousel-img' />
                            </div>
                            <div className="carousel-item" data-bs-interval="5000">
                                <img src={Dos} alt='' className='carousel-img' />
                            </div>
                            <div className="carousel-item" data-bs-interval="5000">
                                <img src={Tres} alt='' className='carousel-img' />
                            </div>
                            <div className="carousel-item" data-bs-interval="5000">
                                <img src={Uno} alt='' className='carousel-img' />
                            </div>
                            <div className="carousel-item" data-bs-interval="5000">
                                <img src={Cinco} alt='' className='carousel-img' />
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;
