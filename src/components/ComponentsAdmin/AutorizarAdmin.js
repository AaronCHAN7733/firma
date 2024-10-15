import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

function AutorizarAdmin({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [requisiciones, setRequisiciones] = useState([]);
  const [direccionId, setDireccionId] = useState(null);
  const navigate = useNavigate(); // Crear instancia de useNavigate

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const fetchDireccionId = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDireccionId(userData.direccionId);
      } else {
        console.error('No se encontró el documento del usuario.');
      }
    } catch (error) {
      console.error('Error al obtener la dirección del usuario:', error);
    }
  };

  const fetchRequisiciones = async (direccionId) => {
    try {
      const requisicionesCollection = collection(db, 'requisiciones');
      const q = query(
        requisicionesCollection,
        where('estatus', '==', 'En autorización'),
        where('direccionId', '==', direccionId)
      );
      const requisicionesSnapshot = await getDocs(q);
      const requisicionesList = requisicionesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequisiciones(requisicionesList);
    } catch (error) {
      console.error('Error al obtener requisiciones:', error);
    }
  };

  useEffect(() => {
    fetchDireccionId();
  }, [user.uid]);

  useEffect(() => {
    if (direccionId) {
      fetchRequisiciones(direccionId);
    }
  }, [direccionId]);

  // Función para manejar la navegación a la página de detalles de la requisición
  const irADetallesRequisicion = (requisicion) => {
    // Navegar a la ruta detallesRequisicion con el ID de la requisición
    navigate(`/AutorizarRequisicion-admin-firmar`, { state: { requisicion } });
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="autorizante" />

        <section className="content">
          <h2>Requisiciones en Autorización</h2>
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
                {requisiciones.length === 0 ? (
                  <tr>
                    <td colSpan="4">No hay requisiciones en autorización.</td>
                  </tr>
                ) : (
                  requisiciones.map((requisicion) => (
                    <tr key={requisicion.id}>
                      <td>{requisicion.folio}</td>
                      <td>{requisicion.fechaElaboracion}</td>
                      <td>{requisicion.estatus}</td>
                      <td>
                        <button
                          className="firmar-btn"
                          onClick={() => irADetallesRequisicion(requisicion)} // Redirigir al hacer clic en el botón
                        >
                          Detalles
                        </button>
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

export default AutorizarAdmin;
