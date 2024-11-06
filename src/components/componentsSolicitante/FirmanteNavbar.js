// src/components/FirmanteNavbar.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faFile } from '@fortawesome/free-solid-svg-icons';
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
        <Link to="/llenarRequisicion-solicitante" className={isActive('/llenarRequisicion-solicitante') ? 'active' : ''}>
      <FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</Link>
      </li>
        <li>
          <Link to="/requisiciones-solicitante" className={isActive('/requisiciones-solicitante') ? 'active' : ''}>
          <FontAwesomeIcon icon={faClock} /> Requisiciones</Link>
        </li>
        <li>
          <Link to="/documentosFinalizados-solicitante" className={isActive('/documentosFinalizados-solicitante') ? 'active' : ''}>
          <FontAwesomeIcon icon={faFile} /> Documentos Finalizados</Link>
        </li>
      </ul>
    </aside>
  );
};

export default FirmanteNavbar;
