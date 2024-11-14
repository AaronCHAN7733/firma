import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReceptorNavbar from "./ReceptorNavnbar";
import TopBar from "../TopBar";
import "../../styles/AdminHome.css";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  FaClipboardList,
  FaClipboardCheck,
  FaFileSignature,
  FaEye,
  FaUserCheck,
} from "react-icons/fa";

function HomeReceptor({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [requisicionesEnAutorizacion, setRequisicionesEnAutorizacion] =
    useState(0);
  const [requisicionesFinalizadas, setRequisicionesFinalizadas] = useState(0);
  const [requisicionesUsuario, setRequisicionesUsuario] = useState(0);

  const [displayRequisiciones, setDisplayRequisiciones] = useState(0);
  const [displayFinalizadas, setDisplayFinalizadas] = useState(0);
  const [displayUsuario, setDisplayUsuario] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Consulta de requisiciones en revisión
      const requisicionesSnap = await getDocs(
        query(
          collection(db, "requisiciones"),
          where("estatus", "==", "En revisión")
        )
      );
      setRequisicionesEnAutorizacion(requisicionesSnap.size);

      // Consulta de requisiciones finalizadas
      const finalizadasSnap = await getDocs(
        query(
          collection(db, "requisiciones"),
          where("estatus", "==", "Finalizado")
        )
      );
      setRequisicionesFinalizadas(finalizadasSnap.size);

      // Consulta de requisiciones del usuario actual
      if (user && user.uid) {
        const usuarioSnap = await getDocs(
          query(
            collection(db, "requisiciones"),
            where("userId", "==", user.uid)
          )
        );
        setRequisicionesUsuario(usuarioSnap.size);
      }
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
    animateCount(setDisplayFinalizadas, requisicionesFinalizadas);
    animateCount(setDisplayUsuario, requisicionesUsuario);
  }, [
    requisicionesEnAutorizacion,
    requisicionesFinalizadas,
    requisicionesUsuario,
  ]);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const goToRequisiciones = () => navigate("/AutorizarRequisicion-admin");
  const goToFinalizadas = () => navigate("/requisiciones-finalizadas");
  const goToUsuarioRequisiciones = () => navigate("/requisiciones-usuario");

  return (
    <div className={`admin-container ${isSidebarVisible ? "shifted" : ""}`}>
      <button
        className={`hamburger-btn ${isSidebarVisible ? "shifted" : ""}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <ReceptorNavbar
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
      />

      <main className={`main-content ${isSidebarVisible ? "shifted" : ""}`}>
        <TopBar userName="Receptor" />

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
                  < FaEye size={40} color="#4CAF50" />
                </div>
                <div className="text">
                  <h3>{displayRequisiciones}</h3>
                  <p>Requisiciones en revisión</p>
                </div>
                <button className="navigate-btn" onClick={goToRequisiciones}>
                  Ver Requisiciones
                </button>
              </div>

              <div className="card-home">
                <div className="icon-box">
                  <FaClipboardCheck size={40} color="#2196F3" />
                </div>
                <div className="text">
                  <h3>{displayFinalizadas}</h3>
                  <p>Requisiciones finalizadas</p>
                </div>
                <button className="navigate-btn" onClick={goToFinalizadas}>
                  Ver Finalizadas
                </button>
              </div>

              <div className="card-home">
                <div className="icon-box">
                  <FaUserCheck size={40} color="#FFC107" />
                </div>
                <div className="text">
                  <h3>{displayUsuario}</h3>
                  <p>Requisiciones realizadas</p>
                </div>
                <button
                  className="navigate-btn"
                  onClick={goToUsuarioRequisiciones}
                >
                  Ver Mis Requisiciones
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

export default HomeReceptor;
