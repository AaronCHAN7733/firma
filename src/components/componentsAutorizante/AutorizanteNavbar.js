import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faFile,faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, Link } from 'react-router-dom'; // Importamos hooks necesarios
; 

const FirmanteNavbar = ({ isSidebarVisible, toggleSidebar }) => {
  const location = useLocation(); // Hook para obtener la ruta actual

   // Verifica si la ruta coincide con el enlace para marcarlo como activo
   const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo"></div>
      <ul className="menu">
      <li>
        <Link to="/LlenarRequisicionAutorizante" className={isActive('/LlenarRequisicionAutorizante') ? 'active' : ''}>
        <FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</Link>
      </li>
        <li>
          <Link to="/seguimiento-Requisiciones" className={isActive('/seguimiento-Requisiciones') ? 'active' : ''}>
          <FontAwesomeIcon icon={faClock} /> Requisiciones</Link>
        </li>
        <li>
          <Link to="/AutorizarRequisicion" className={isActive('/AutorizarRequisicion') ? 'active' : ''}>
          <FontAwesomeIcon icon={faCheckCircle} /> Autorizar Requisicion</Link>
        </li>
        <li>
          <Link to="/documentosFinalizados-autorizante" className={isActive('/documentoFinalizados-autorizante') ? 'active' : ''}>
          <FontAwesomeIcon icon={faFile} /> Documentos Finalizados</Link></li>
      </ul>
    </aside>
  );
};

export default FirmanteNavbar;