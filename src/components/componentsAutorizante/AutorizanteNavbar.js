import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faFile,faCheckCircle } from '@fortawesome/free-solid-svg-icons';
; 

const FirmanteNavbar = ({ isSidebarVisible, toggleSidebar }) => {
  

  return (
    <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
      <div className="logo"></div>
      <ul className="menu">
      <li><a href="/LlenarRequisicionAutorizante"><FontAwesomeIcon icon={faFileAlt} /> Llenar requisición</a></li>
        <li><a href="/seguimiento-Requisiciones"><FontAwesomeIcon icon={faClock} /> Requisiciones</a></li>
        <li><a href="/AutorizarRequisicion"><FontAwesomeIcon icon={faCheckCircle} /> Autorizar Requisicion</a></li>
        <li><a href="/documentosFinalizados"><FontAwesomeIcon icon={faFile} /> Documentos Finalizados</a></li>
      </ul>
    </aside>
  );
};

export default FirmanteNavbar;