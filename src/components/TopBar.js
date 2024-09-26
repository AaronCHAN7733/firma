import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, doc, getDocs, collection, query, where, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import Modal from 'react-modal';
import '../styles/AdminHome.css';

Modal.setAppElement('#root');

function TopBar() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [areaDescription, setAreaDescription] = useState('');
  const [direccionData, setDireccionData] = useState({});
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [pendingSignatures, setPendingSignatures] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const notificationDropdownRef = useRef(null);
  const [messagesVisible, setMessagesVisible] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState([]);

  useEffect(() => {
    const fetchUserRoleAndNotifications = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data.role);
          setUserData(data);
          
          // Fetch area and direction data
          if (data.areaId) {
            const areaDoc = await getDoc(doc(db, 'areas', data.areaId));
            if (areaDoc.exists()) {
              setAreaDescription(areaDoc.data().descripcion);
            }
          }
          if (data.direccionId) {
            const direccionDoc = await getDoc(doc(db, 'direcciones', data.direccionId));
            if (direccionDoc.exists()) {
              setDireccionData(direccionDoc.data());
            }
          }
          
          // Fetch notifications
          const notificationsQuery = query(collection(db, 'notificaciones'), where('usuarioId', '==', user.uid));
          const notificationsSnapshot = await getDocs(notificationsQuery);
          const notificationsData = notificationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserNotifications(notificationsData);
        }
      }
      setLoading(false);
    };

    fetchUserRoleAndNotifications();
  }, []);

  useEffect(() => {
    const fetchPendingSignatures = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'firmas'), where('estado', '==', 'pendiente'));
      const querySnapshot = await getDocs(q);
      const firmasData = [];
      for (const firmaDoc of querySnapshot.docs) {
        const firma = firmaDoc.data();
        const userDocRef = doc(db, 'users', firma.usuarioId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          firmasData.push({
            id: firmaDoc.id,
            codigo: firma.codigo,
            estado: firma.estado,
            nombreUsuario: userData.nombre,
            usuarioId: firma.usuarioId
          });
        }
      }
      setPendingSignatures(firmasData);
    };

    fetchPendingSignatures();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
    setMessagesVisible(false);
  };

  const toggleMessages = () => {
    setMessagesVisible(!messagesVisible);
    setNotificationsVisible(false);
  };

  const handleNotificationClick = (notificationId) => {
    if (!seenNotifications.includes(notificationId)) {
      const updatedSeenNotifications = [...seenNotifications, notificationId];
      setSeenNotifications(updatedSeenNotifications);
      localStorage.setItem('seenNotifications', JSON.stringify(updatedSeenNotifications));
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationsVisible(false);
      }
    };
    if (notificationsVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [notificationsVisible]);

  const updateSignatureStatus = async (id, newStatus, usuarioId) => {
    try {
      const db = getFirestore();
      const firmaRef = doc(db, 'firmas', id);
      await updateDoc(firmaRef, { estado: newStatus });

      if (newStatus === 'autorizado') {
        await addDoc(collection(db, 'notificaciones'), {
          usuarioId: usuarioId,
          mensaje: `Tu firma ha sido ${newStatus}`,
          fecha: new Date().toISOString()
        });

        const realtimeDb = getDatabase();
        const notificationRef = ref(realtimeDb, `notificaciones/${usuarioId}/${Date.now()}`);
        await set(notificationRef, {
          mensaje: `Tu firma ha sido ${newStatus}`,
          fecha: new Date().toISOString(),
        });
      }

      setPendingSignatures((prevSignatures) => prevSignatures.filter((signature) => signature.id !== id));
    } catch (error) {
      console.error('Error al actualizar el estado de la firma:', error);
    }
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
          <button className="notification-icon" onClick={toggleNotifications}>
            <FontAwesomeIcon icon={faBell} />
            {userNotifications.length - seenNotifications.length > 0 && (
              <span className="notification-badge">
                {userNotifications.length - seenNotifications.length}
              </span>
            )}
          </button>
          {notificationsVisible && (
            <div className="solicitudes-dropdown" ref={notificationDropdownRef}>
              <ul>
                {userNotifications.length === 0 ? (
                  <li>No hay notificaciones recientes</li>
                ) : (
                  userNotifications.map((notification) => (
                    <li key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
                      {notification.mensaje} <br />
                      {new Date(notification.fecha).toLocaleString()}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          {role === 'admin' && (
            <div className="message-dropdown">
              <button className="message-icon" onClick={toggleMessages}>
                <FontAwesomeIcon icon={faEnvelope} />
                {pendingSignatures.length > 0 && <span className="notification-badge">{pendingSignatures.length}</span>}
              </button>
              {messagesVisible && (
                <div className="dropdown-menu">
                  <ul>
                    {pendingSignatures.length === 0 ? (
                      <li>No hay firmas pendientes</li>
                    ) : (
                      pendingSignatures.map((signature) => (
                        <li key={signature.id}>
                          <strong>Código:</strong> {signature.codigo} <br />
                          <strong>Estado:</strong> {signature.estado} <br />
                          <strong>Usuario:</strong> {signature.nombreUsuario}
                          <div className="signature-actions">
                            <button className="btn-accept" onClick={() => updateSignatureStatus(signature.id, 'autorizado', signature.usuarioId)}>Aceptar</button>
                            <button className="btn-deny" onClick={() => updateSignatureStatus(signature.id, 'denegado', signature.usuarioId)}>Denegar</button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
  )}
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

      {/* Modal para ver el perfil */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="modal-overlay">
        <h2>Perfil de Usuario</h2>
        <div className="profile-details">
          <p><strong>Nombre:</strong> {userData.nombre}</p>
          <p><strong>Correo Electrónico:</strong> {userData.correo}</p>
          <p><strong>Rol:</strong> {userData.role}</p>
          <p><strong>Estado:</strong> {userData.estado}</p>
          <p><strong>Área:</strong> {areaDescription}</p>
          <p><strong>Dirección:</strong> {direccionData.descripcion}</p>
        </div>
        <button className="boton" onClick={closeModal}>Cerrar</button>
      </Modal>
    </header>
  );
}

export default TopBar;
