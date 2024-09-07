// src/components/Home.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';  // Asumiendo que tienes la autenticación configurada
import '../styles/Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';  // Importa los íconos

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  // Estado para controlar la visibilidad de la barra lateral
  const navigate = useNavigate();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');  // Redirigir al usuario a la página de inicio de sesión
    }).catch((error) => {
      console.error("Error al cerrar sesión: ", error);
    });
  };

  // Función para alternar la visibilidad de la barra lateral
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="home-container">
      <button className="toggle-button" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>  {/* Ícono de hamburguesa */}
      </button>
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/firma">Ver Firma</Link></li>
          {/* Puedes agregar más enlaces aquí */}
          <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
        </ul>
      </nav>
      <div className="content">
        <h1>Bienvenido a la página principal</h1>
        {/* Aquí va el contenido de la página */}
      </div>
    </div>
  );
};

export default Home;
