import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import TopBar from "../TopBar";
import "../../styles/AdminHome.css";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaUsers, FaFileSignature, FaClipboardList, FaKey, FaUserCheck } from "react-icons/fa";

function AdminHome({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [requisicionesEnAutorizacion, setRequisicionesEnAutorizacion] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [firmasAutorizadas, setFirmasAutorizadas] = useState(0);
  const [requisicionesUsuario, setRequisicionesUsuario] = useState(0);
  const [requisicionesEnAsignacionClave, setRequisicionesEnAsignacionClave] = useState(0);

  const [displayRequisiciones, setDisplayRequisiciones] = useState(0);
  const [displayUsuarios, setDisplayUsuarios] = useState(0);
  const [displayFirmas, setDisplayFirmas] = useState(0);
  const [displayRequisicionesUsuario, setDisplayRequisicionesUsuario] = useState(0);
  const [displayRequisicionesClave, setDisplayRequisicionesClave] = useState(0);

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

      const requisicionesUsuarioSnap = await getDocs(
        query(collection(db, "requisiciones"), where("userId", "==", user?.uid))
      );
      setRequisicionesUsuario(requisicionesUsuarioSnap.size);

      const requisicionesClaveSnap = await getDocs(
        query(collection(db, "requisiciones"), where("estatus", "==", "En asignacion de clave"))
      );
      setRequisicionesEnAsignacionClave(requisicionesClaveSnap.size);
    };

    fetchData();
  }, [user]);

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
    animateCount(setDisplayRequisicionesUsuario, requisicionesUsuario);
    animateCount(setDisplayRequisicionesClave, requisicionesEnAsignacionClave);
  }, [requisicionesEnAutorizacion, totalUsuarios, firmasAutorizadas, requisicionesUsuario, requisicionesEnAsignacionClave]);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const goToUsuarios = () => navigate("/usuarios");
  const goToRequisiciones = () => navigate("/firmar-requisiciones");
  const goToFirmas = () => navigate("/firmas");
  const goToClaves = () => navigate("/claves-presupuestales")
  const goToRequisicionesEnAutorizacion = () => navigate ("/AutorizarRequisicion-admin")

  return (
    <div className={`admin-container ${isSidebarVisible ? "shifted" : ""}`}>
      <button
        className={`hamburger-btn ${isSidebarVisible ? "shifted" : ""}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? "shifted" : ""}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          <div className="titulo-container">
            <h1 className="tituloHome">
              Sistema de Requisiciones de Bienes y/o Servicios
            </h1>
          </div>

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
                <button className="navigate-btn" onClick={goToRequisicionesEnAutorizacion}>
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
                  <p>Validaciones autorizadas</p>
                </div>
                <button className="navigate-btn" onClick={goToFirmas}>
                  Ver Validaciones
                </button>
              </div>

              <div className="card-home">
                <div className="icon-box">
                  <FaUserCheck size={40} color="#FF5722" />
                </div>
                <div className="text">
                  <h3>{displayRequisicionesUsuario}</h3>
                  <p>Requisiciones realizadas</p>
                </div>
                <button className="navigate-btn" onClick={goToRequisiciones}>
                  Ver Mis Requisiciones
                </button>
              </div>

              <div className="card-home">
                <div className="icon-box">
                  <FaKey size={40} color="#9C27B0" />
                </div>
                <div className="text">
                  <h3>{displayRequisicionesClave}</h3>
                  <p>Requisiciones en asignación de clave</p>
                </div>
                <button className="navigate-btn" onClick={goToClaves}>
                  Ver Requisiciones en Asignación
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
