import React, { useState, useEffect } from 'react';
import OperativoNavbar from './OperativoNavbar';
import TopBar from './TopBar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/HistorialRequisiciones.css';

function HistorialRequisiciones({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [requisiciones, setRequisiciones] = useState([]);
  const [filteredRequisiciones, setFilteredRequisiciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequisicion, setSelectedRequisicion] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const fetchRequisiciones = async () => {
      const requisicionesCollection = collection(db, 'requisiciones');
      const q = query(requisicionesCollection, where('userId', '==', user.uid)); // Filtra por el usuario actual
      const requisicionesSnapshot = await getDocs(q);
      const requisicionesList = requisicionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequisiciones(requisicionesList);
      setFilteredRequisiciones(requisicionesList);
    };

    fetchRequisiciones();
  }, [user.uid]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredRequisiciones].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredRequisiciones(sortedData);
  };

  const showModal = (requisicion) => {
    setSelectedRequisicion(requisicion);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequisicion(null);
  };

  const calcularTotal = () => {
    if (!selectedRequisicion || !selectedRequisicion.items) return 0;
    return selectedRequisicion.items.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <OperativoNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Operativo" />

        <section className="content">
          <h2>Requisiciones pendientes</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('folio')}>
                    Folio {sortConfig.key === 'folio' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('fechaElaboracion')}>
                    Fecha Elaboración {sortConfig.key === 'fechaElaboracion' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('estatus')}>
                    Estatus {sortConfig.key === 'estatus' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Detalles</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisiciones.map((requisicion) => (
                  <tr key={requisicion.id}>
                    <td>{requisicion.folio}</td>
                    <td>{requisicion.fechaElaboracion}</td>
                    <td>{requisicion.estatus}</td>
                    <td>
                      <button
                        className="details-btn"
                        onClick={() => showModal(requisicion)}
                      >
                        Ver detalles
                      </button>
                    </td>
                    <td>
                      <button className="edit-btn">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {modalVisible && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Detalles de la Requisición</h3>
              <div className="modal-details-grid">
                <div><strong>Usuario que realizo la Requisición:</strong> {selectedRequisicion.nombreUsuario}</div> {/* Campo añadido */}
                <div><strong>Área solicitante:</strong> {selectedRequisicion.areaSolicitante}</div>
                <div><strong>Componente:</strong> {selectedRequisicion.componente}</div>
                <div><strong>Concepto:</strong> {selectedRequisicion.concepto}</div>
                <div><strong>Dirección de Adscripción:</strong> {selectedRequisicion.direccionAdscripcion}</div>
                <div><strong>Estatus:</strong> {selectedRequisicion.estatus}</div>
                <div><strong>Fecha de Elaboración:</strong> {selectedRequisicion.fechaElaboracion}</div>
                <div><strong>Fecha del Evento:</strong> {selectedRequisicion.fechaEvento}</div>
                <div><strong>Folio:</strong> {selectedRequisicion.folio}</div>
                <div><strong>Nombre del Evento:</strong> {selectedRequisicion.nombreEvento}</div>
                <div className="modal-items">
                  <h4>Materiales/Servicios</h4>
                  <table className="modal-items-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Precio Unitario</th>
                        <th>Concepto</th>
                        <th>Partida</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequisicion.items.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.unidad}</td>
                          <td>{item.precioUnitario}</td>
                          <td>{item.concepto}</td>
                          <td>{item.partida}</td>
                          <td>{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="total-section">
                  <strong>Total: </strong> {calcularTotal().toFixed(2)}
                </div>
              </div>
              <button onClick={closeModal} className="close-modal-btn">Cerrar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HistorialRequisiciones;
