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
  const [requisicionesFirmadas, setRequisicionesFirmadas] = useState([]); // Para almacenar IDs de requisiciones firmadas
  const [isLoading, setIsLoading] = useState([]); // Estado de carga individual por requisición
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // Función para obtener las requisiciones firmadas desde la colección 'FlujoDeFirmas'
  const fetchRequisicionesFirmadas = async (requisicionesList) => {
    try {
      const flujoDeFirmasCollection = collection(db, 'FlujoDeFirmas');
      const q = query(
        flujoDeFirmasCollection,
        where('requisicionId', 'in', requisicionesList.map((r) => r.id)) // Verificar si las requisiciones están firmadas
      );
      const firmadasSnapshot = await getDocs(q);
      const firmadasList = firmadasSnapshot.docs.map((doc) => doc.data().requisicionId); // Obtener solo los IDs de las requisiciones firmadas
      setRequisicionesFirmadas(firmadasList);
    } catch (error) {
      console.error('Error fetching firmadas:', error);
    }
  };

  useEffect(() => {
    const fetchRequisiciones = async () => {
      try {
        const requisicionesCollection = collection(db, 'requisiciones');
        const q = query(requisicionesCollection, where('userId', '==', user.uid)); // Obtiene todas las requisiciones creadas por el usuario
        const requisicionesSnapshot = await getDocs(q);
        const requisicionesList = requisicionesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequisiciones(requisicionesList);

        // Establece los estados de carga para cada requisición
        setIsLoading(Array(requisicionesList.length).fill(true));

        // Llama a la función para verificar las requisiciones firmadas
        await fetchRequisicionesFirmadas(requisicionesList);
      } catch (error) {
        console.error('Error fetching requisiciones:', error);
      } finally {
        setIsLoading(Array(requisiciones.length).fill(false)); // Desactiva el estado de carga para todas las requisiciones
      }
    };

    fetchRequisiciones();
  }, [user.uid]);

  const handleFirmarRequisicion = (requisicion) => {
    navigate('/firmar', { state: { requisicion } });
  };

  const requisicionesPendientes = requisiciones; // Mostrar todas las requisiciones del usuario

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
                      <td>{requisicion.folio}</td>
                      <td>{requisicion.fechaElaboracion}</td>
                      <td>{requisicion.estatus}</td>
                      <td>
                        {isLoading[index] ? (
                          <span>Cargando...</span> // Mostrar "Cargando..." mientras se verifica cada requisición
                        ) : (
                          <>
                            <button className="firmar-btn" onClick={() => handleFirmarRequisicion(requisicion)}>
                              Ver Detalles
                            </button>
                            {!requisicionesFirmadas.includes(requisicion.id) && (
                              <button className="rechazar-btn">Rechazar</button>
                            )}
                          </>
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
