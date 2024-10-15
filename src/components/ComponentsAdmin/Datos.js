import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapSigns, FaClipboardList, FaCogs, FaSitemap, FaHistory } from 'react-icons/fa'; // Importación de íconos
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import '../../styles/AdminHome.css';

function Datos({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleNavigation = (path) => {
    navigate(path);
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
              <FaBuilding className="card-icon" />
              <div className="card-text">
                <h3>Áreas</h3>
                <p>Gestión de áreas internas</p>
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/direcciones')}>
              <FaMapSigns className="card-icon" />
              <div className="card-text">
                <h3>Direcciones</h3>
                <p>Administración de direcciones</p>
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/partidas')}>
              <FaClipboardList className="card-icon" />
              <div className="card-text">
                <h3>Partidas</h3>
                <p>Listado de partidas presupuestales</p>
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/componentes')}>
              <FaCogs className="card-icon" />
              <div className="card-text">
                <h3>Componentes</h3>
                <p>Configuración y componentes</p>
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/organigrama')}>
              <FaSitemap className="card-icon" />
              <div className="card-text">
                <h3>Organigrama</h3>
                <p>Estructura organizativa</p>
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/historial')}>
              <FaHistory className="card-icon" />
              <div className="card-text">
                <h3>Historial de Requisiciones</h3>
                <p>Revisión de requisiciones pasadas</p>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Datos;
