// src/components/FirmanteNavbar.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faFile } from '@fortawesome/free-solid-svg-icons';
; 

const FirmanteNavbar = ({ isSidebarVisible, toggleSidebar }) => {
  

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo"></div>
      <ul className="menu">
      <li><a href="/llenar-Requisicion"><FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</a></li>
        <li><a href="/llenarRequisicion-solicitante"><FontAwesomeIcon icon={faClock} /> Requisiciones</a></li>
        <li><a href="/documentosFinalizados"><FontAwesomeIcon icon={faFile} /> Documentos Finalizados</a></li>
      </ul>
    </aside>
  );
};

export default FirmanteNavbar;
