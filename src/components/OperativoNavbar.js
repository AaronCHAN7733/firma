// src/components/OperativoNavbar.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faFile } from '@fortawesome/free-solid-svg-icons';



const OperativoNavbar = ({ isSidebarVisible, toggleSidebar }) => {

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo"></div>
      <ul className="menu">
        <li><a href="/llenarRequisicion"><FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</a></li>
        <li><a href="/historial"><FontAwesomeIcon icon={faClock} /> Historial</a></li>
        <li><a href="/documentosFinalizados"><FontAwesomeIcon icon={faFile} /> Documentos Finalizados</a></li>
      </ul>
    </aside>
  );
};

export default OperativoNavbar;
