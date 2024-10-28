import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBell,faEnvelope,faUser,faCog,} from "@fortawesome/free-solid-svg-icons";
import {getFirestore,doc,getDocs,collection,query,where,getDoc,updateDoc,addDoc,
} from "firebase/firestore";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";
import Modal from "react-modal";
import "../styles/AdminHome.css";

Modal.setAppElement("#root");

function TopBar() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [areaDescription, setAreaDescription] = useState("");
  const [direccionData, setDireccionData] = useState({});
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [pendingSignatures, setPendingSignatures] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const notificationDropdownRef = useRef(null); // Para el dropdown de notificaciones
  const [messagesVisible, setMessagesVisible] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState([]);
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false);
  const [topBarColor, setTopBarColor] = useState("#3b5998"); // Color por defecto

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role);
            setUserData(data);
            if (data.areaId) {
              const areaDoc = await getDoc(doc(db, "areas", data.areaId));
              if (areaDoc.exists()) {
                setAreaDescription(areaDoc.data().descripcion);
              } else {
                console.error("No se encontró el documento de área");
              }
            }
            if (data.direccionId) {
              const direccionDoc = await getDoc(
                doc(db, "direcciones", data.direccionId)
              );
              if (direccionDoc.exists()) {
                setDireccionData(direccionDoc.data());
              } else {
                console.error("No se encontró el documento de dirección");
              }
            }
           // Obtener notificaciones del usuario
            const notificationsQuery = query(
              collection(db, "notificaciones"),
              where("usuarioId", "==", user.uid)
            );
            const notificationsSnapshot = await getDocs(notificationsQuery);
            const notificationsData = notificationsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Ordena las notificaciones por fecha en orden descendente
            notificationsData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            setUserNotifications(notificationsData);
          } else {
            console.error("El documento del usuario no existe");
          }
        } else {
          console.error("No hay usuario autenticado");
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      } finally {
        setLoading(false);
      }
      const savedSeenNotifications =
        JSON.parse(localStorage.getItem("seenNotifications")) || [];
      setSeenNotifications(savedSeenNotifications);
    };

    const fetchPendingSignatures = async () => {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "firmas"),
          where("estado", "==", "pendiente")
        );
        const querySnapshot = await getDocs(q);
        const firmasData = [];

        for (const firmaDoc of querySnapshot.docs) {
          const firma = firmaDoc.data();
          const userDocRef = doc(db, "users", firma.usuarioId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            firmasData.push({
              id: firmaDoc.id,
              codigo: firma.codigo,
              estado: firma.estado,
              nombreUsuario: userData.nombre,
              usuarioId: firma.usuarioId,
            });
          }
        }
        setPendingSignatures(firmasData);
      } catch (error) {
        console.error("Error al obtener las firmas pendientes:", error);
      }
    };

    fetchUserRole();
    fetchPendingSignatures();

    const updateData = async () => {
      await fetchUserRole();
      await fetchPendingSignatures();
    };

    updateData(); // Llamar la función para cargar los datos inicialmente

    // Establecer un intervalo para actualizar los datos cada 30 segundos (30000 ms)
    const interval = setInterval(() => {
      updateData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  const handlePasswordReset = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await sendPasswordResetEmail(auth, user.email);
        alert(
          "Se ha enviado un correo de restablecimiento de contraseña a tu dirección de correo."
        );
      } else {
        alert("No se encontró el usuario actual.");
      }
    } catch (error) {
      console.error(
        "Error al enviar el correo de restablecimiento de contraseña:",
        error
      );
      alert("Error al intentar enviar el correo de restablecimiento.");
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
    setMessagesVisible(false); // Cerrar el dropdown de mensajes al abrir notificaciones
  };

  const toggleMessages = () => {
    setMessagesVisible(!messagesVisible);
    setNotificationsVisible(false); // Cerrar el dropdown de notificaciones al abrir mensajes
  };
  const handleNotificationClick = (notificationId) => {
    if (!seenNotifications.includes(notificationId)) {
      const updatedSeenNotifications = [...seenNotifications, notificationId];
      setSeenNotifications(updatedSeenNotifications);
      localStorage.setItem(
        "seenNotifications",
        JSON.stringify(updatedSeenNotifications)
      );
    }
  };
  const toggleSettingsModal = () => {
    setSettingsModalIsOpen(!settingsModalIsOpen);
  };

  const handleChangeTopBarColor = (color) => {
    setTopBarColor(color);
    document.querySelector(".top-bar").style.backgroundColor = color;
  };

  // Maneja clics fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationsVisible(false);
      }
    };
    if (notificationsVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [notificationsVisible]);

  const updateSignatureStatus = async (id, newStatus, usuarioId) => {
    try {
      const db = getFirestore();
      const firmaRef = doc(db, "firmas", id);
      await updateDoc(firmaRef, { estado: newStatus });

      // Almacenar notificación
      if (newStatus === "autorizado") {
        await addDoc(collection(db, "notificaciones"), {
          usuarioId: usuarioId,
          mensaje: `Tu firma ha sido ${newStatus}`,
          fecha: new Date().toISOString(),
        });
      }

      // Actualizar las firmas pendientes
      setPendingSignatures((prevSignatures) =>
        prevSignatures.filter((signature) => signature.id !== id)
      );
    } catch (error) {
      console.error("Error al actualizar el estado de la firma:", error);
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
          <div className="settings-icon">
            <button onClick={toggleSettingsModal}>
              <FontAwesomeIcon icon={faCog} />
            </button>
          </div>
          <button className="notification-icon" onClick={toggleNotifications}>
            <FontAwesomeIcon icon={faBell} />
            {userNotifications.length - seenNotifications.length > 0 && (
              <span className="notification-badge">
                {userNotifications.length - seenNotifications.length}
              </span>
            )}
            <Modal
              isOpen={settingsModalIsOpen}
              onRequestClose={toggleSettingsModal}
              className="modal-config"
              overlayClassName="modal-overlay-config"
            >
              <h2>Configuración</h2>
              <div className="config-options">
                <button onClick={handlePasswordReset}>
                  Recuperar Contraseña
                </button>
                <button onClick={() => alert("Detalles de la aplicación")}>
                  Ver Detalles de la Aplicación
                </button>
                <button onClick={() => alert("Contactarnos")}>
                  Contactanos
                </button>

                <div className="color-options">
                  <h3>Cambiar Color de la Barra</h3>
                  <button
                    onClick={() => handleChangeTopBarColor("#3b5998")}
                    style={{ backgroundColor: "#3b5998", color: "#fff" }} // Azul
                  >
                    Azul
                  </button>
                  <button
                    onClick={() => handleChangeTopBarColor("#ff6347")}
                    style={{ backgroundColor: "#ff6347", color: "#fff" }} // Rojo
                  >
                    Rojo
                  </button>
                  <button
                    onClick={() => handleChangeTopBarColor("#32cd32")}
                    style={{ backgroundColor: "#32cd32", color: "#fff" }} // Verde
                  >
                    Verde
                  </button>
                </div>
              </div>
              <button className="boton" onClick={toggleSettingsModal}>
                Cerrar
              </button>
            </Modal>
          </button>
          {notificationsVisible && (
            <div className="solicitudes-dropdown" ref={notificationDropdownRef}>
              <ul>
                {userNotifications.length === 0 ? (
                  <li>No hay notificaciones recientes</li>
                ) : (
                  userNotifications.map((notification, index) => (
                    <li
                      key={index}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <strong></strong> {notification.mensaje} <br />
                      <strong></strong>{" "}
                      {new Date(notification.fecha).toLocaleString()}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          {role === "admin" && (
            <div className="message-dropdown">
              <button className="message-icon" onClick={toggleMessages}>
                <FontAwesomeIcon icon={faEnvelope} />
                {pendingSignatures.length > 0 && (
                  <span className="notification-badge">
                    {pendingSignatures.length}
                  </span>
                )}
              </button>
              {messagesVisible && (
                <div className="dropdown-menu">
                  <ul>
                    {pendingSignatures.length === 0 ? (
                      <li>No hay firmas pendientes</li>
                    ) : (
                      pendingSignatures.map((signature, index) => (
                        <li key={index}>
                          <strong>Código:</strong> {signature.codigo} <br />
                          <strong>Estado:</strong> {signature.estado} <br />
                          <strong>Usuario:</strong> {signature.nombreUsuario}
                          <div className="signature-actions">
                            <button
                              className="btn-accept"
                              onClick={() =>
                                updateSignatureStatus(
                                  signature.id,
                                  "autorizado",
                                  signature.usuarioId
                                )
                              }
                            >
                              Aceptar
                            </button>
                            <button
                              className="btn-deny"
                              onClick={() =>
                                updateSignatureStatus(
                                  signature.id,
                                  "denegado",
                                  signature.usuarioId
                                )
                              }
                            >
                              Denegar
                            </button>
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
                <div className="dropdown-menu-detalles-usuario">
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-detallesUsuario"
        overlayClassName="modal-overlay-detallesUsuario"
      >
        <h2>Perfil de Usuario</h2>
        <div className="profile-details">
          <p>
            <strong>Nombre:</strong> {userData.nombre}
          </p>
          <p>
            <strong>Correo Electrónico:</strong> {userData.correo}
          </p>
          <p>
            <strong>Rol:</strong> {userData.role}
          </p>
          <p>
            <strong>Estado:</strong> {userData.estado}
          </p>
          <p>
            <strong>Área:</strong> {areaDescription}
          </p>
          <p>
            <strong>Dirección:</strong> {direccionData.descripcion}
          </p>
        </div>
        <button className="boton" onClick={closeModal}>
          Cerrar
        </button>
      </Modal>
    </header>
  );
}

export default TopBar;
