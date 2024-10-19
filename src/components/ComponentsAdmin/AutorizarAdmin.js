import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import { collection, getDocs, doc, getDoc, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import '../../styles/Autorizar.css';
import Swal from 'sweetalert2';

function AutorizarAdmin({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [requisiciones, setRequisiciones] = useState([]);
  const [direccionId, setDireccionId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [requisicionRechazada, setRequisicionRechazada] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const fetchDireccionId = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setDireccionId(userDoc.data().direccionId);
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

  const irADetallesRequisicion = (requisicion) => {
    navigate(`/AutorizarRequisicion-admin-firmar`, { state: { requisicion } });
  };

  // Abrir modal de rechazo
  const abrirModalRechazo = (requisicion) => {
    setRequisicionRechazada(requisicion);
    setModalOpen(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalOpen(false);
    setMotivoRechazo('');
  };

  // Manejar rechazo y actualización en Firebase
  const manejarRechazo = async () => {
    if (!motivoRechazo) {
      alert('Debe proporcionar un motivo de rechazo.');
      return;
    }

    try {
      // Actualizar el estatus de la requisición y agregar motivo de rechazo
      await updateDoc(doc(db, 'requisiciones', requisicionRechazada.id), {
        estatus: 'Rechazado',
        motivoRechazo: motivoRechazo, // Guardar motivo de rechazo
      });

      // Agregar notificación
      await addDoc(collection(db, 'notificaciones'), {
        fecha: new Date().toISOString(),
        mensaje: `Tu requisición con folio ${requisicionRechazada.folio} ha sido rechazada.`,
        usuarioId: requisicionRechazada.userId,
      });

      Swal.fire({
        title: "Requisicion rechaza y notificacion enviada",
        icon: "success",
        button: "Aceptar"
      });
      cerrarModal(); // Cerrar modal
      fetchRequisiciones(direccionId); // Refrescar la lista de requisiciones
    } catch (error) {
      console.error('Error al rechazar la requisición:', error);
    }
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
                        {requisicion.estatus !== 'Rechazado' ? (
                          <>
                            <button className="firmar-btn" onClick={() => irADetallesRequisicion(requisicion)}>
                              Detalles
                            </button>
                            <button className="rechazar-btn" onClick={() => abrirModalRechazo(requisicion)}>
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span>Requisición Rechazada</span>
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
            <h3>Rechazar Requisición</h3>
            <textarea
              placeholder="Motivo del rechazo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            />
            <div className="modal-actions-Auto">
              <button onClick={manejarRechazo}>Confirmar</button>
              <button onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutorizarAdmin;
