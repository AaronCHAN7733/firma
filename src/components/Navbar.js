import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faUser, faPen, faClock, faHeadset, 
  faDatabase, faCog, faFileAlt, faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { useLocation, Link } from 'react-router-dom'; // Importamos hooks necesarios
import '../styles/AdminHome.css';

const Navbar = ({ isSidebarVisible }) => {
  const location = useLocation(); // Hook para obtener la ruta actual

  // Verifica si la ruta coincide con el enlace para marcarlo como activo
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo-nav"></div>
      <ul className="menu">
        <li>
          <Link to="/adminHome" className={isActive('/adminHome') ? 'active' : ''}>
            <FontAwesomeIcon icon={faHome} /> Inicio
          </Link>
        </li>
        <li>
          <Link to="/usuarios" className={isActive('/usuarios') ? 'active' : ''}>
            <FontAwesomeIcon icon={faUser} /> Usuarios
          </Link>
        </li>
        <li>
          <Link to="/firmas" className={isActive('/firmas') ? 'active' : ''}>
            <FontAwesomeIcon icon={faPen} /> Firmas
          </Link>
        </li>
        <li>
          <Link to="/tiempos" className={isActive('/tiempos') ? 'active' : ''}>
            <FontAwesomeIcon icon={faClock} /> Tiempos
          </Link>
        </li>
        <li>
          <Link to="/soporte" className={isActive('/soporte') ? 'active' : ''}>
            <FontAwesomeIcon icon={faHeadset} /> Soporte
          </Link>
        </li>
        <li>
          <Link to="/datos" className={isActive('/datos') ? 'active' : ''}>
            <FontAwesomeIcon icon={faDatabase} /> Datos
          </Link>
        </li>
        <li>
          <Link to="/llenarRequisicion-admin" className={isActive('/llenarRequisicion-admin') ? 'active' : ''}>
            <FontAwesomeIcon icon={faFileAlt} /> Llenar requisición
          </Link>
        </li>
        <li>
          <Link to="/firmar-requisiciones" className={isActive('/firmar-requisiciones') ? 'active' : ''}>
            <FontAwesomeIcon icon={faFileAlt} /> Requisiciones
          </Link>
        </li>
        <li>
          <Link to="/AutorizarRequisicion-admin" className={isActive('/AutorizarRequisicion-admin') ? 'active' : ''}>
            <FontAwesomeIcon icon={faCheckCircle} /> Autorizar Requisición
          </Link>
        </li>
        <li>
          <Link to="/configuracion" className={isActive('/configuracion') ? 'active' : ''}>
            <FontAwesomeIcon icon={faCog} /> Configuración
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Navbar;
