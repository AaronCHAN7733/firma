import React, { useState, useEffect } from 'react';
import AutorizanteNavbar from './AutorizanteNavbar'
import TopBar from '../TopBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { getDoc, doc } from 'firebase/firestore'; // Importa las funciones necesarias de Firestore
import { auth, db } from '../../firebase'; // Importa la instancia de Firebase y Firestore
import '../../styles/HomeAutorizante.css';

function HomeFirmante() {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [userData, setUserData] = useState({}); // Estado para guardar los datos del usuario (nombre y rol)
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener el usuario actual que ha iniciado sesión
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Obtener el UID del usuario actual
          const uid = currentUser.uid;

          // Referencia al documento del usuario en Firestore
          const userDocRef = doc(db, 'users', uid);
          
          // Obtener el documento del usuario
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Guardar los datos del usuario (nombre y rol)
            setUserData(userDoc.data());
          } else {
            console.log("No se encontró el documento del usuario.");
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario: ", error);
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchUserData();
  }, []); // Se ejecuta una sola vez al montar el componente

  if (loading) {
    return <p>Cargando datos...</p>; // Mensaje de carga mientras se obtienen los datos
  }

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      {/* Usamos el componente FirmanteNavbar aquí */}
      <AutorizanteNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        {/* Usamos el nuevo componente TopBar */}
        <TopBar userName="autorizante" />

        <section className="content">
          <div className="user-card">
            <h2>{userData.nombre || 'Usuario'}</h2> {/* Mostramos el nombre desde Firestore */}
            <div className="user-icon-Autorizante">
              {/* Icono de FontAwesome */}
              <FontAwesomeIcon icon={faUser} size="4x" />
            </div>
            <p>Rol: {userData.role || 'Desconocido'}</p> {/* Mostramos el rol desde Firestore */}
            <p>Estatus: Activo</p> {/* El estatus sigue siendo estático */}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomeFirmante;
