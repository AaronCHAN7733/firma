
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faPen, faClock, faHeadset, faDatabase, faCog, faSignOutAlt,faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut } from 'firebase/auth'; 
import { auth } from '../firebase'; 
import '../styles/AdminHome.css';

const Navbar = ({ isSidebarVisible, toggleSidebar }) => {
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
        <li><a href="/adminHome"><FontAwesomeIcon icon={faHome} /> Inicio</a></li>
        <li><a href="/usuarios"><FontAwesomeIcon icon={faUser} /> Usuarios</a></li>
        <li><a href="/firmas"><FontAwesomeIcon icon={faPen} /> Firmas</a></li>
        <li><a href="/tiempos"><FontAwesomeIcon icon={faClock} /> Tiempos</a></li>
        <li><a href="/soporte"><FontAwesomeIcon icon={faHeadset} /> Soporte</a></li>
        <li><a href="/datos"><FontAwesomeIcon icon={faDatabase} /> Datos</a></li>
        <li><a href="/llenarRequisiciones"><FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</a></li>
        <li><a href="/configuracion"><FontAwesomeIcon icon={faCog} /> Configuración</a></li>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
          </button>
        </div>
      </ul>
    </aside>
  );
};

export default Navbar;
