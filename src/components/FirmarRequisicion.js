import React, { useState, useEffect } from 'react';
import FirmanteNavbar from './FirmanteNavbar';
import TopBar from './TopBar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate de que la configuración de Firebase esté correctamente importada
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para redirigir
import '../styles/FirmarRequisicion.css'

function FirmarRequisicion({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [requisiciones, setRequisiciones] = useState([]);
  const navigate = useNavigate(); // Hook de react-router para navegar entre rutas

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const fetchRequisiciones = async () => {
      try {
        const requisicionesCollection = collection(db, 'requisiciones');
        const requisicionesSnapshot = await getDocs(requisicionesCollection);
        const requisicionesList = requisicionesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() // Obtén los datos de cada documento
        }));
        setRequisiciones(requisicionesList);
      } catch (error) {
        console.error('Error fetching requisiciones:', error);
      }
    };

    fetchRequisiciones();
  }, []);

  const handleFirmarRequisicion = (requisicion) => {
    navigate('/firmar', { state: { requisicion } });
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <FirmanteNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Firmante" />

        <section className="content">
          <h2>Requisiciones pendientes</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha Elaboración</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requisiciones.map((requisicion) => (
                  <tr key={requisicion.id}>
                    <td>{requisicion.folio}</td>
                    <td>{requisicion.fechaElaboracion}</td>
                    <td>
                      <button className="firmar-btn" onClick={() => handleFirmarRequisicion(requisicion)}>
                        Firmar
                      </button>
                      <button className="rechazar-btn">Rechazar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default FirmarRequisicion;
