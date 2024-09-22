
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faPen, faClock, faHeadset, faDatabase, faCog,faFileAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/AdminHome.css';

const Navbar = ({ isSidebarVisible, toggleSidebar }) => {
  

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
      </ul>
    </aside>
  );
};

export default Navbar;
