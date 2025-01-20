import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Perfil from './components/Perfil'; // Importación correcta

import appFirebase from './credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth(appFirebase);

function App() {
  const [usuario, setUsuario] = useState(null);

  onAuthStateChanged(auth, (usuarioFirebase) => {
    if (usuarioFirebase) {
      setUsuario(usuarioFirebase);
    } else {
      setUsuario(null);
    }
  });

  return (
    <Router>
      <Routes>
        {/* Define las rutas */}
        <Route path="/" element={usuario ? <Home correoUsuario={usuario.email} /> : <Login />} />
        <Route path="/perfil" element={<Perfil />} /> {/* Ruta para Perfil */}
      </Routes>
    </Router>
  );
}

export default App;
