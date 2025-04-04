import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Perfil from './components/Perfil';
import Importe from './components/Importe';
import Editar from './components/Editar';
import ScrollToTop from './components/ScrollToTop';


function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await fetch('https://api.jaison.mx/Analisis_Perros/index.php?action=obtenerUsuarios', {
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.usuario) {
          setUsuario(data.usuario);
        } else {
          setUsuario(null);
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
        setUsuario(null);
      }
    };

    verificarSesion();
  }, []);

  return (
    
    <Router basename="/">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={usuario ? <Home usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/MiPerfil" element={usuario ? <Perfil usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/Importar" element={usuario ? <Importe usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/Editar" element={usuario ? <Editar usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
      </Routes>
    </Router>
  );
}

export default App;
