import React, { useState } from 'react';
import OperativoNavbar from './OperativoNavbar';  // Importamos el componente OperativoNavbar
import TopBar from './TopBar';  // Importamos el nuevo componente TopBar


function HomeOperativos({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      {/* Usamos el componente OperativoNavbar aquí */}
      <OperativoNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        {/* Usamos el nuevo componente TopBar */}
        <TopBar userName="Operativo" />

        <section className="content">
        </section>
      </main>
    </div>
  );
}

export default HomeOperativos;
