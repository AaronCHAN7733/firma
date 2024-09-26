import React, { useState, useEffect } from 'react';
import FirmanteNavbar from './FirmanteNavbar';
import TopBar from '../TopBar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import '../../styles/FirmarRequisicion.css';

function FirmarRequisicion({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [requisiciones, setRequisiciones] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]); // Estado para filas expandidas
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Estado para detectar si es móvil
  const navigate = useNavigate();

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const fetchRequisiciones = async () => {
    try {
      const requisicionesCollection = collection(db, 'requisiciones');
      const q = query(requisicionesCollection, where('userId', '==', user.uid));
      const requisicionesSnapshot = await getDocs(q);
      const requisicionesList = requisicionesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequisiciones(requisicionesList);
    } catch (error) {
      console.error('Error fetching requisiciones:', error);
    }
  };

  useEffect(() => {
    fetchRequisiciones();
  }, [user.uid]);

  const handleFirmarRequisicion = (requisicion) => {
    navigate('/firmar', { state: { requisicion } });
  };

  // Función para alternar la visualización completa del folio en móviles
  const toggleFolioExpansion = (requisicionId) => {
    if (expandedRows.includes(requisicionId)) {
      setExpandedRows(expandedRows.filter((id) => id !== requisicionId)); // Ocultar
    } else {
      setExpandedRows([...expandedRows, requisicionId]); // Mostrar completo
    }
  };

  const requisicionesPendientes = requisiciones;

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <FirmanteNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Firmante" />

        <section className="content">
          <h2>Requisiciones</h2>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha Elaboración</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requisicionesPendientes.length === 0 ? (
                  <tr>
                    <td colSpan="4">No hay requisiciones pendientes para firmar.</td>
                  </tr>
                ) : (
                  requisicionesPendientes.map((requisicion, index) => (
                    <tr key={requisicion.id}>
                      <td
                        onClick={() => isMobile && toggleFolioExpansion(requisicion.id)} // Solo expandir en móvil
                        style={{ cursor: isMobile ? 'pointer' : 'default' }} // Mostrar puntero solo en móviles
                      >
                        {/* Mostrar solo los primeros 8 caracteres en móvil */}
                        {isMobile && !expandedRows.includes(requisicion.id)
                          ? `${requisicion.folio.substring(0, 8)}...`
                          : requisicion.folio}
                      </td>
                      <td>{requisicion.fechaElaboracion}</td>
                      <td>{requisicion.estatus}</td>
                      <td>
                        <button className="firmar-btn" onClick={() => handleFirmarRequisicion(requisicion)}>
                          Ver Detalles
                        </button>
                        {/* Quitar botón de rechazar si el estatus es "En autorización" */}
                        {requisicion.estatus !== 'En autorización' && (
                          <button className="rechazar-btn">Rechazar</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default FirmarRequisicion;
