import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Importar métodos adicionales
import { db } from '../../firebase'; // Instancia de Firebase
import Modal from 'react-modal'; // Importar React Modal
import Swal from 'sweetalert2'; // Importar SweetAlert2
import Navbar from '../Navbar';
import TopBar from '../TopBar';
import '../../styles/Usuarios.css'; // Estilos proporcionados

// Establece el elemento root para el modal
Modal.setAppElement('#root');

function Firmas({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [firmasData, setFirmasData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFirma, setSelectedFirma] = useState(null);
  const [newEstado, setNewEstado] = useState('');

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const fetchFirmasData = async () => {
      try {
        const firmasSnapshot = await getDocs(collection(db, 'firmas'));
        const firmasPromises = firmasSnapshot.docs.map(async (firmaDoc) => {
          const firmaData = firmaDoc.data();

          // Obtener datos del usuario relacionado
          const userDoc = await getDoc(doc(db, 'users', firmaData.usuarioId));
          const userData = userDoc.data();

          // Obtener el área relacionada
          const areaDoc = await getDoc(doc(db, 'areas', userData.areaId));
          const areaData = areaDoc.data();

          // Obtener la dirección relacionada
          const direccionDoc = await getDoc(doc(db, 'direcciones', userData.direccionId));
          const direccionData = direccionDoc.data();

          // Devolver todos los datos necesarios
          return {
            id: firmaDoc.id, // ID del documento de firma
            nombre: userData.nombre,
            role: userData.role,
            direccion: direccionData.descripcion,
            area: areaData.descripcion,
            codigoDeFirma: firmaData.codigo,
            estado: firmaData.estado,
          };
        });

        const resolvedFirmasData = await Promise.all(firmasPromises);
        setFirmasData(resolvedFirmasData);
      } catch (error) {
        console.error('Error fetching firmas data:', error);
      }
    };

    fetchFirmasData();
  }, []);

  // Función para abrir el modal y establecer la firma seleccionada
  const openModal = (firma) => {
    setSelectedFirma(firma);
    setNewEstado(firma.estado); // Inicializa el valor con el estado actual
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFirma(null);
  };

  // Función para manejar el cambio de estado
  const handleEstadoChange = (e) => {
    setNewEstado(e.target.value);
  };

  // Función para actualizar el estado de la firma en Firebase
  const handleSave = async () => {
    if (selectedFirma) {
      try {
        const firmaRef = doc(db, 'firmas', selectedFirma.id);
        await updateDoc(firmaRef, { estado: newEstado });

        // Actualizar el estado localmente después de guardar
        setFirmasData((prevFirmas) =>
          prevFirmas.map((firma) =>
            firma.id === selectedFirma.id ? { ...firma, estado: newEstado } : firma
          )
        );

        // Alerta de éxito usando SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El estado de la firma ha sido actualizado.',
          timer: 2000,
          showConfirmButton: false,
        });

        closeModal(); // Cerrar el modal después de guardar
      } catch (error) {
        console.error('Error updating firma:', error);
      }
    }
  };

  // Función para eliminar la firma
  const handleDelete = async (firmaId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Eliminar de Firebase
          await deleteDoc(doc(db, 'firmas', firmaId));

          // Actualizar el estado local para eliminar la firma de la tabla
          setFirmasData((prevFirmas) => prevFirmas.filter((firma) => firma.id !== firmaId));

          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'La firma ha sido eliminada.',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error('Error deleting firma:', error);
        }
      }
    });
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
          <h1>Firmas</h1>

          <table className="user-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Dirección</th>
                <th>Área</th>
                <th>Código de Firma</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {firmasData.map((firma, index) => (
                <tr key={index}>
                  <td>{firma.nombre}</td>
                  <td>{firma.role}</td>
                  <td>{firma.direccion}</td>
                  <td>{firma.area}</td>
                  <td>{firma.codigoDeFirma}</td>
                  <td>{firma.estado}</td>
                  <td>
                    <button onClick={() => openModal(firma)}>Editar</button>
                    <button onClick={() => handleDelete(firma.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Modal para editar el estado */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="Modal-user"
          overlayClassName="ReactModal__Overlay"
        >
          <h2>Editar Estado de Firma</h2>
          <form>
            <label htmlFor="estado">Estado</label>
            <select id="estado" value={newEstado} onChange={handleEstadoChange}>
              <option value="autorizado">Autorizar</option>
              <option value="denegado">Denegar</option>
            </select>
          </form>
          <button onClick={handleSave}>Guardar</button>
          <button onClick={closeModal}>Cancelar</button>
        </Modal>
      )}
    </div>
  );
}

export default Firmas;
