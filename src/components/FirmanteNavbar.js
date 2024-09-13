// src/components/FirmanteNavbar.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faEnvelope, faClock, faFile, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut } from 'firebase/auth'; 
import { auth } from '../firebase'; 

const FirmanteNavbar = ({ isSidebarVisible, toggleSidebar }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('Sesión cerrada exitosamente');
      window.location.href = '/login'; 
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo"></div>
      <ul className="menu">
        <li><a href="/firmarRequisicion"><FontAwesomeIcon icon={faFileAlt} /> Firmar requisición</a></li>
        <li><a href="/mensaje"><FontAwesomeIcon icon={faEnvelope} /> Mensaje</a></li>
        <li><a href="/historial"><FontAwesomeIcon icon={faClock} /> Historial</a></li>
        <li><a href="/documentosFinalizados"><FontAwesomeIcon icon={faFile} /> Documentos Finalizados</a></li>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
          </button>
        </div>
      </ul>
    </aside>
  );
};

export default FirmanteNavbar;
