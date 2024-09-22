import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Modal from 'react-modal';
import '../styles/AdminHome.css'; 

Modal.setAppElement('#root'); // Especificar el elemento raíz para accesibilidad

function TopBar() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [areaDescription, setAreaDescription] = useState('');
  const [direccionData, setDireccionData] = useState({});

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role);
            setUserData(data);
            if (data.areaId) {
              const areaDoc = await getDoc(doc(db, 'areas', data.areaId));
              if (areaDoc.exists()) {
                setAreaDescription(areaDoc.data().descripcion);
              } else {
                console.error('No se encontró el documento de área');
              }
            }
            if (data.direccionId) {
              const direccionDoc = await getDoc(doc(db, 'direcciones', data.direccionId));
              if (direccionDoc.exists()) {
                setDireccionData(direccionDoc.data());
              } else {
                console.error('No se encontró el documento de dirección');
              }
            }
          } else {
            console.error('El documento del usuario no existe');
          }
        } else {
          console.error('No hay usuario autenticado');
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <header className="top-bar">
      <div className="right-content">
        <div className="icons">
          <button className="notification-icon">
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button className="message-icon">
            <FontAwesomeIcon icon={faEnvelope} />
          </button>
        </div>
        <div className="user-info">
          {loading ? (
            <span>Cargando...</span>
          ) : (
            <>
              <div className="user-dropdown" onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faUser} /> {`Bienvenido, ${role}`}
                <span className="dropdown-icon">▼</span>
              </div>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  <ul>
                    <li onClick={openModal}>Ver Perfil</li>
                    <li onClick={handleLogout}>Cerrar Sesión</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Perfil de Usuario"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Perfil del Usuario</h2>
        <div>
          <p><strong>Nombre:</strong> {userData.nombre}</p>
          <p><strong>Correo:</strong> {userData.correo}</p>
          <p><strong>Teléfono:</strong> {userData.telefono}</p>
          <p><strong>Role:</strong> {userData.role}</p>
          <p><strong>Estado:</strong> {userData.estado}</p>
          <p><strong>Área:</strong> {areaDescription}</p>
          <p><strong>Dirección:</strong> {direccionData.descripcion} (Clave UR: {direccionData.claveUR})</p>
        </div>
        <button className='boton' onClick={closeModal}>Cerrar</button>
      </Modal>
    </header>
  );
}

export default TopBar;
