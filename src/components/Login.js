import React, { useState, useEffect } from 'react'

import Uno from '../images/1.jpg'
import Dos from '../images/2.png'
import Tres from '../images/3.png'

import appFirebase from '../credenciales'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const auth = getAuth(appFirebase);
const firestore = getFirestore(appFirebase);

const Login = () => {
    
    const [registro, setRegistro] = useState(false);

    const handlerSubmit = async (e) => {
        e.preventDefault();
        const correo = e.target.email.value;
        const contraseña = e.target.contraseña.value;

        if (registro) {
            const nombre = e.target.nombre.value;
            const apellidos = e.target.apellidos.value;

            try {
                // Crear usuario en Firebase Auth
                const infoUsuario = await createUserWithEmailAndPassword(auth, correo, contraseña);

                // Referencia al documento en Firestore
                const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);

                // Guardar datos en Firestore, incluyendo contraseña
                await setDoc(docuRef, {
                    correo,
                    contraseña,
                    nombre,
                    apellidos
                });

                alert('Usuario registrado con éxito');
            } catch (error) {
                console.error('Error al registrar el usuario:', error);
                alert('Asegurate que tu contraseña tenga más de seis carácteres.');
            }
        } else {
            try {
                await signInWithEmailAndPassword(auth, correo, contraseña);
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Correo o contraseña incorrectos.');
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const carousel = new window.bootstrap.Carousel(document.querySelector('#carouselExampleIndicators'));
            carousel.next();
        }, 5000); // Avanzar cada 5 segundos

        return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonte
    }, []);

    return (
        <div className='container d-flex justify-content-center align-items-center p-4'>
        <div className='row w-100'>
            {/* Formulario */}
            <div className='col-md-4'>
                <div className='mt-5 p-4 border rounded shadow-sm'>
                    <h1 className='text-center mb-4'>{registro ? 'Regístrate' : 'Inicia sesión'}</h1>
                    <form onSubmit={handlerSubmit}>
                        {registro && (
                            <>
                                <div className='mb-3'>
                                    <label className='form-label'>Nombre:</label>
                                    <input type='text' className='form-control' placeholder='Ingresa tu nombre' id='nombre' required />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label'>Apellidos:</label>
                                    <input type='text' className='form-control' placeholder='Ingresa tus apellidos' id='apellidos' required />
                                </div>
                            </>
                        )}
                        <div className='mb-3'>
                            <label className='form-label'>Correo electrónico:</label>
                            <input type='email' className='form-control' placeholder='Ingresa tu correo' id='email' required />
                        </div>
                        <div className='mb-3'>
                            <label className='form-label'>Contraseña:</label>
                            <input type='password' className='form-control' placeholder='Ingresa tu contraseña' id='contraseña' required />
                        </div>
                        <div className='d-grid gap-2'>
                            <button className='btn btn-primary' type='submit'>
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
                    </div>
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img src={Dos} alt='' className='d-block w-100' />
                        </div>
                        <div className="carousel-item">
                            <img src={Tres} alt='' className='d-block w-100' />
                        </div>
                        <div className="carousel-item">
                            <img src={Uno} alt='' className='d-block w-100' />
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
    
    )
}

export default Login
