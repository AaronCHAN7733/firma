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
  const [expandedRows, setExpandedRows] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isModalOpen, setModalOpen] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [selectedRequisicionId, setSelectedRequisicionId] = useState(null); // Estado para almacenar el ID de la requisición seleccionada
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
    navigate('/firmar-solicitante', { state: { requisicion } });
  };

  const toggleFolioExpansion = (requisicionId) => {
    if (expandedRows.includes(requisicionId)) {
      setExpandedRows(expandedRows.filter((id) => id !== requisicionId));
    } else {
      setExpandedRows([...expandedRows, requisicionId]);
    }
  };

  const requisicionesPendientes = requisiciones;

  const abrirModalMotivo = (motivo, requisicionId) => {
    setMotivoRechazo(motivo);
    setSelectedRequisicionId(requisicionId); // Almacenar el ID de la requisición
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setMotivoRechazo('');
    setSelectedRequisicionId(null); // Limpiar el ID de la requisición al cerrar el modal
  };

  const handleEditRequisicion = () => {
    navigate('/editar-requisicion', { state: { requisicionId: selectedRequisicionId } });
    cerrarModal(); // Cerrar el modal al redirigir
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <FirmanteNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Admin" />

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
                    <td colSpan="4">No tienes requisiciones realizadas.</td>
                  </tr>
                ) : (
                  requisicionesPendientes.map((requisicion) => (
                    <tr key={requisicion.id}>
                      <td
                        onClick={() => isMobile && toggleFolioExpansion(requisicion.id)}
                        style={{ cursor: isMobile ? 'pointer' : 'default' }}
                      >
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
                        {requisicion.estatus === 'En Firma' && (
                          <button className="rechazar-btn">Rechazar</button>
                        )}
                        {requisicion.estatus === 'Rechazado' && (
                          <button
                            className="rechazar-btn"
                            onClick={() => abrirModalMotivo(requisicion.motivoRechazo, requisicion.id)} // Pasar el ID al modal
                          >
                            Ver Motivo
                          </button>
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

      {isModalOpen && (
        <div className="modal-Auto">
          <div className="modal-content-Auto">
            <h3>Motivo de Rechazo</h3>
            <p>{motivoRechazo}</p>
            <button className="firmar-btn" onClick={cerrarModal}>Cerrar</button>
            <button className="firmar-btn" onClick={handleEditRequisicion}>Editar</button> {/* Botón de editar */}
          </div>
        </div>
      )}
    </div>
  );
}

export default FirmarRequisicion;
