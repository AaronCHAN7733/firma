import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapSigns, FaClipboardList, FaCogs, FaSitemap, FaHistory } from 'react-icons/fa'; // Importación de íconos
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import { getFirestore, collection, getDocs } from 'firebase/firestore'; // Importa Firestore
import '../../styles/AdminHome.css';

function Datos({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [dataCounts, setDataCounts] = useState({
    areas: 0,
    direcciones: 0,
    partidas: 0,
    componentes: 0,
  });
  const navigate = useNavigate();
  const db = getFirestore(); // Inicializa Firestore

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Función para obtener la cantidad de documentos en cada colección
  const fetchDataCounts = async () => {
    try {
      const areasSnapshot = await getDocs(collection(db, 'areas'));
      const direccionesSnapshot = await getDocs(collection(db, 'direcciones'));
      const partidasSnapshot = await getDocs(collection(db, 'partidas'));
      const componentesSnapshot = await getDocs(collection(db, 'componentes'));

      setDataCounts({
        areas: areasSnapshot.size,
        direcciones: direccionesSnapshot.size,
        partidas: partidasSnapshot.size,
        componentes: componentesSnapshot.size,
      });
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  useEffect(() => {
    fetchDataCounts(); // Llama a la función cuando se monta el componente
  }, []);

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          <div className='content-container'>
          <h1>Resgistros de datos</h1>
          <div className="cards-grid">
            <button className="card" onClick={() => handleNavigation('/areas')}>
              <FaBuilding className="card-icon" />
              <div className="card-text">
                <h3>Áreas</h3>
                <p>Gestión de áreas internas</p>
                <span>{dataCounts.areas} areas</span> {/* Mostrar cantidad de datos */}
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/direcciones')}>
              <FaMapSigns className="card-icon" />
              <div className="card-text">
                <h3>Direcciones</h3>
                <p>Administración de direcciones</p>
                <span>{dataCounts.direcciones} direcciones</span> {/* Mostrar cantidad de datos */}
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/partidas')}>
              <FaClipboardList className="card-icon" />
              <div className="card-text">
                <h3>Partidas</h3>
                <p>Listado de partidas presupuestales</p>
                <span>{dataCounts.partidas} partidas</span> {/* Mostrar cantidad de datos */}
              </div>
            </button>
            <button className="card" onClick={() => handleNavigation('/componentes')}>
              <FaCogs className="card-icon" />
              <div className="card-text">
                <h3>Componentes</h3>
                <p>Configuración y componentes</p>
                <span>{dataCounts.componentes} componentes</span> {/* Mostrar cantidad de datos */}
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

          </div>
          
        </section>
      </main>
    </div>
  );
}

export default Datos;
