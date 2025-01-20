import React, { useState } from 'react'

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

    return (
        <div className='row container p-4'>
            <div className='col-md-8'>
                <div id="carouselExampleIndicators" className="carousel slide">
                    <div className="carousel-indicators">
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    </div>
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img src={Uno} alt='' className='tamaño-imagen' />
                        </div>
                        <div className="carousel-item">
                            <img src={Dos} alt='' className='tamaño-imagen' />    </div>
                        <div className="carousel-item">
                            <img src={Tres} alt='' className='tamaño-imagen' />    </div>
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
            {/* Formulario */}
            <div className='col-md-4'>
            <div className='mt-5 ms-5'>
                <h1>{registro ? 'Regístrate' : 'Inicia sesión'}</h1>
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
                    <button className='btn btn-primary mt-4 form-control' type='submit'>
                        {registro ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </form>
                <div className='form-group'>
                    <button className='btn btn-secondary mt-4 form-control' onClick={() => setRegistro(!registro)}>
                        {registro ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Login
