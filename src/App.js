import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Perfil from './components/Perfil';
import Importe from './components/Importe';


function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await fetch('https://api.jaison.mx/Analisis_Perros/index.php?', {
          credentials: 'include',
        });

        const data = await response.json();
        console.log("Respuesta del backend:", data);

        if (data.success) {
          setUsuario(data);  // Guarda todo el objeto recibido
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
    <Router basename="/app1">
      <Routes>
        <Route path="/" element={usuario ? <Home usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/MiPerfil" element={usuario ? <Perfil usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
        <Route path="/Importar" element={usuario ? <Importe usuario={usuario} setUsuario={setUsuario} /> : <Login setUsuario={setUsuario} />} />
      </Routes> 
    </Router>
  );
}

export default App;
