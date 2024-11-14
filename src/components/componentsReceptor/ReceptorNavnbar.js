import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faFile,faEye,faHome} from '@fortawesome/free-solid-svg-icons';
import { useLocation, Link } from 'react-router-dom'; // Importamos hooks necesarios
; 

const ReceptorNavbar = ({ isSidebarVisible, toggleSidebar }) => {
  const location = useLocation(); // Hook para obtener la ruta actual

   // Verifica si la ruta coincide con el enlace para marcarlo como activo
   const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo"></div>
      <ul className="menu">
      <li>
        <Link to="/homeReceptor" className={isActive('/homeReceptor') ? 'active' : ''}>
        <FontAwesomeIcon icon={faHome} /> Inicio </Link>
      </li>
      <li>
        <Link to="/LlenarRequisicionReceptor" className={isActive('/LlenarRequisicionReceptor') ? 'active' : ''}>
        <FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</Link>
      </li>
        <li>
          <Link to="/Requisiciones-Receptor" className={isActive('/Requisiciones-Receptors') ? 'active' : ''}>
          <FontAwesomeIcon icon={faClock} /> Requisiciones</Link>
        </li>
        <li>
          <Link to="/documentosFinalizados-autorizante" className={isActive('/documentoFinalizados-autorizante') ? 'active' : ''}>
          <FontAwesomeIcon icon={faFile} /> Documentos Finalizados</Link>
        </li>
        <li>
          <Link to="/Requisiones-sin-revisar" className={isActive('/Requisiones-sin-revisar') ? 'active' : ''}>
          <FontAwesomeIcon icon={faEye} /> Revisar Requisiciones</Link>
        </li>
      </ul>
      
    </aside>
  );
};

export default ReceptorNavbar;