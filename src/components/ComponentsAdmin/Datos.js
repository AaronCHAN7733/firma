import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importamos useNavigate para redirigir
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import '../../styles/AdminHome.css';

function Datos({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();  // Hook para navegación

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleNavigation = (path) => {
    navigate(path);  // Función para redirigir a la ruta correspondiente
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          <div className="cards-grid">
            <button className="card" onClick={() => handleNavigation('/areas')}>
              Áreas
            </button>
            <button className="card" onClick={() => handleNavigation('/direcciones')}>
              Direcciones
            </button>
            <button className="card" onClick={() => handleNavigation('/partidas')}>
              Partidas
            </button>
            <button className="card" onClick={() => handleNavigation('/componentes')}>
              Componentes
            </button>
            <button className="card" onClick={() => handleNavigation('/organigrama')}>
              Organigrama
            </button>
            <button className="card" onClick={() => handleNavigation('/organigrama')}>
              Historial de Requisiciones
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Datos;
