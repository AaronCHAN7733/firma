import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import TopBar from "../TopBar";
import "../../styles/AdminHome.css";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaUsers, FaFileSignature, FaClipboardList } from "react-icons/fa";

function AdminHome({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [requisicionesEnAutorizacion, setRequisicionesEnAutorizacion] =
    useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [firmasAutorizadas, setFirmasAutorizadas] = useState(0);

  const [displayRequisiciones, setDisplayRequisiciones] = useState(0);
  const [displayUsuarios, setDisplayUsuarios] = useState(0);
  const [displayFirmas, setDisplayFirmas] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const requisicionesSnap = await getDocs(
        query(
          collection(db, "requisiciones"),
          where("estatus", "==", "En autorización")
        )
      );
      setRequisicionesEnAutorizacion(requisicionesSnap.size);

      const usuariosSnap = await getDocs(collection(db, "users"));
      setTotalUsuarios(usuariosSnap.size);

      const firmasSnap = await getDocs(
        query(collection(db, "firmas"), where("estado", "==", "autorizado"))
      );
      setFirmasAutorizadas(firmasSnap.size);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const animateCount = (setter, value) => {
      let start = 0;
      const increment = Math.ceil(value / 50);
      const interval = setInterval(() => {
        start += increment;
        if (start >= value) {
          clearInterval(interval);
          setter(value);
        } else {
          setter(start);
        }
      }, 50);
    };

    animateCount(setDisplayRequisiciones, requisicionesEnAutorizacion);
    animateCount(setDisplayUsuarios, totalUsuarios);
    animateCount(setDisplayFirmas, firmasAutorizadas);
  }, [requisicionesEnAutorizacion, totalUsuarios, firmasAutorizadas]);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const goToUsuarios = () => navigate("/usuarios");
  const goToRequisiciones = () => navigate("/AutorizarRequisicion-admin");
  const goToFirmas = () => navigate("/firmas");

  return (
    <div className={`admin-container ${isSidebarVisible ? "shifted" : ""}`}>
      <button
        className={`hamburger-btn ${isSidebarVisible ? "shifted" : ""}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <Navbar
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />

      <main className={`main-content ${isSidebarVisible ? "shifted" : ""}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          <h1 className="tituloHome">
            Sistema de Requisiciones de Bienes y/o Servicios
          </h1>

          <section className="content-card">
            <div className="cards-container-home">
              <h2>Accesos rápidos</h2>

              <div className="card-home">
                <div className="icon-box">
                  <FaClipboardList size={40} color="#4CAF50" />
                </div>
                <div className="text">
                  <h3>{displayRequisiciones}</h3>
                  <p>Requisiciones en autorización</p>
                </div>
                <button className="navigate-btn" onClick={goToRequisiciones}>
                  Ver Requisiciones
                </button>
              </div>

              <div className="card-home">
                <div className="icon-box">
                  <FaUsers size={40} color="#2196F3" />
                </div>
                <div className="text">
                  <h3>{displayUsuarios}</h3>
                  <p>Total de usuarios</p>
                </div>
                <button className="navigate-btn" onClick={goToUsuarios}>
                  Ver Usuarios
                </button>
              </div>

              <div className="card-home">
                <div className="icon-box">
                  <FaFileSignature size={40} color="#FFC107" />
                </div>
                <div className="text">
                  <h3>{displayFirmas}</h3>
                  <p>Firmas autorizadas</p>
                </div>
                <button className="navigate-btn" onClick={goToFirmas}>
                  Ver Firmas
                </button>
              </div>
            </div>
          </section>
          <div className="organigrama-section">
            <h2>Organigrama de la institución</h2>
            <div className="organigramaimg" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminHome;
