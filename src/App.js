import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Perfil from './components/Perfil';
import Importe from './components/Importe';
import Editar from './components/Editar';
import ScrollToTop from './components/ScrollToTop';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://api.jaison.mx/Analisis_Perros/index.php?action=obtenerUsuarios', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.usuario) {
            setUsuario(data.usuario);
          } else {
            setUsuario(null);
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Error al verificar sesión:", error);
          setUsuario(null);
          localStorage.removeItem('token');
        }
      }
    };

    verificarSesion();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    navigate('/');
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={usuario ? <Home usuario={usuario} setUsuario={setUsuario} cerrarSesion={cerrarSesion} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/MiPerfil" element={usuario ? <Perfil usuario={usuario} setUsuario={setUsuario} cerrarSesion={cerrarSesion} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/Importar" element={usuario ? <Importe usuario={usuario} setUsuario={setUsuario} cerrarSesion={cerrarSesion} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/Editar" element={usuario ? <Editar usuario={usuario} setUsuario={setUsuario} cerrarSesion={cerrarSesion} /> : <Login setUsuario={setUsuario} />} />
      </Routes>
    </>
  );
}

export default App;
