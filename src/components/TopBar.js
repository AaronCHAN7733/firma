// src/components/TopBar.js
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Firebase Authentication
import '../styles/AdminHome.css'; 

function TopBar() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser; // Obtiene el usuario autenticado

        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid)); // Busca el documento con el uid del usuario

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role); // Asigna el rol desde los datos del usuario
          } else {
            console.log('El documento del usuario no existe');
          }
        } else {
          console.log('No hay usuario autenticado');
        }
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

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
          ) : role ? (
            <span>{`Hola ${role}`}</span>  // Muestra "Hola" y el rol del usuario
          ) : (
            <span>Usuario sin rol</span>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
