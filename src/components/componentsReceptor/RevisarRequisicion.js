import React, { useState, useEffect } from "react";
import "../../styles/DetallesRequisicion.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import Swal from "sweetalert2";
import RevisarRequisiciones from "./RevisarRequisiciones";
import ReceptorNavbar from "./ReceptorNavnbar";
import TopBar from "../TopBar";

function RevisarRequisicion() {
  const location = useLocation();
  const { requisicion } = location.state || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [firma, setFirma] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [firmaExistente, setFirmaExistente] = useState(null);
  const [codigoFirma, setCodigoFirma] = useState("");
  const [firmaValidada, setFirmaValidada] = useState(false);
  const [estadoFirma, setEstadoFirma] = useState(null);
  const [cargandoRequisicion, setCargandoRequisicion] = useState(true);
  const [requisicionFirmada, setRequisicionFirmada] = useState(false);
  const [detallesFirmas, setDetallesFirmas] = useState([]);
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  const auth = getAuth();
  const usuario = auth.currentUser;
  const navigate = useNavigate();

  // Calcular total de la requisición
  const calcularTotal = () => {
    if (!requisicion.items) return 0;
    return requisicion.items.reduce(
      (acc, item) => acc + parseFloat(item.subtotal || 0),
      0
    );
  };
  const generarCodigoFirma = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const verificarRequisicionFirmada = async () => {
    setCargandoRequisicion(false);
  };

  // Llama a la función verificarRequisicionFirmada dentro de useEffect
  useEffect(() => {
    if (requisicion) {
      obtenerFirmaExistente();
      verificarRequisicionFirmada();
    }
  }, [requisicion]);

  // Generar un hash de firma
  const generarHashFirma = async (firma) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(firma + usuario.uid);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  // Obtener la firma existente del usuario
  const obtenerFirmaExistente = async () => {
    const firmaRef = doc(db, "firmas", usuario.uid);
    const firmaSnap = await getDoc(firmaRef);
    if (firmaSnap.exists()) {
      const firmaData = firmaSnap.data();
      setFirmaExistente(firmaData);
      setEstadoFirma(firmaData.estado); // Estatus de la firma
    } else {
      console.log("No existe firma para este usuario");
    }
  };

  // Abrir modal para firmar la requisición
  const abrirModal = async () => {
    setModalVisible(true);
    await obtenerFirmaExistente(); // Asegura que la firma se cargue antes de abrir el modal
  };

  // Verificar y validar la firma
  const firmarRequisicion = async () => {
    // Validación de la firma
    if (firma.length !== 5 || isNaN(firma)) {
      setMensajeError("La firma debe ser un número de 5 dígitos");
      return;
    }

    const firmaHash = await generarHashFirma(firma);

    // Verificar si ya existe una firma
    if (firmaExistente) {
      if (firmaHash !== firmaExistente.firma) {
        setMensajeError("La firma no es válida o no coincide");
        return;
      }

      if (estadoFirma === "autorizado") {
        const nuevaFirma = {
          firmaId: usuario.uid,
          codigo: firmaExistente.codigo,
          fecha: new Date().toISOString(),
          accion: "revisó",
        };

        try {
          // Actualizar flujo de firmas
          const flujoDeFirmasRef = doc(db, "flujoDeFirmas", requisicion.id);
          await updateDoc(flujoDeFirmasRef, {
            firmas: arrayUnion(nuevaFirma),
          });

          // Actualizar estatus de la requisición
          await updateDoc(doc(db, "requisiciones", requisicion.id), {
            estatus: "En asignacion de clave",
          });

          Swal.fire({
            title: "¡Éxito!",
            text: "Requisición firmada y estatus actualizado correctamente.",
            icon: "success",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error("Error al firmar la requisición:", error);
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al firmar la requisición. Intenta de nuevo.",
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "No se encontró una firma existente para este usuario. Por favor, asegúrate de crear una firma antes de intentar firmar la requisición.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    }

    setFirmaValidada(true);
    setMensajeError("");
    setFirma("");
    setModalVisible(false);
  };

  useEffect(() => {
    const filtrarFirmasSolicitadas = async () => {
      try {
        const flujoDeFirmasRef = doc(db, "flujoDeFirmas", requisicion.id);
        const flujoDeFirmasSnap = await getDoc(flujoDeFirmasRef);

        if (flujoDeFirmasSnap.exists()) {
          const firmasData = flujoDeFirmasSnap.data().firmas || [];

          const detallesFirmasPromises = firmasData.map(async (firma) => {
            const usuarioRef = doc(db, "users", firma.firmaId);
            const usuarioSnap = await getDoc(usuarioRef);

            if (usuarioSnap.exists()) {
              const nombreUsuario = usuarioSnap.data().nombre;
              return {
                nombreUsuario,
                codigo: firma.codigo,
                fechaFirma: firma.fecha,
                accion: firma.accion,
              };
            }
            return null;
          });

          const detallesFirmasResult = await Promise.all(
            detallesFirmasPromises
          );
          setDetallesFirmas(
            detallesFirmasResult.filter((detalle) => detalle !== null)
          );
        }
      } catch (error) {
        console.error("Error al obtener firmas solicitadas:", error);
      }
    };

    if (requisicion) {
      filtrarFirmasSolicitadas();
    }
  }, [requisicion]);

  if (!requisicion) {
    return <p>No hay detalles para mostrar</p>;
  }
  const obtenerDetallesFirmas = async () => {
    try {
      // Referencia al documento de flujo de firmas de la requisición
      const flujoDeFirmasRef = doc(db, "flujoDeFirmas", requisicion.id);
      const flujoDeFirmasSnap = await getDoc(flujoDeFirmasRef);

      if (flujoDeFirmasSnap.exists()) {
        const firmasData = flujoDeFirmasSnap.data().firmas || [];

        // Obtener detalles de cada firma
        const detallesFirmasPromises = firmasData.map(async (firma) => {
          // Obtener la referencia de la firma en la colección `firmas`
          const firmaRef = doc(db, "firmas", firma.firmaId);
          const firmaSnap = await getDoc(firmaRef);

          if (firmaSnap.exists()) {
            const { usuarioId, codigo } = firmaSnap.data();

            // Obtener el nombre del usuario desde la colección `users`
            const usuarioRef = doc(db, "users", usuarioId);
            const usuarioSnap = await getDoc(usuarioRef);

            if (usuarioSnap.exists()) {
              const nombreUsuario = usuarioSnap.data().nombre;

              return {
                nombreUsuario,
                codigo,
                fechaFirma: firma.fechaFirma,
              };
            }
          }
          return null;
        });

        const detallesFirmasResult = await Promise.all(detallesFirmasPromises);
        setDetallesFirmas(
          detallesFirmasResult.filter((detalle) => detalle !== null)
        );
      }
    } catch (error) {
      console.error("Error al obtener detalles de las firmas:", error);
    }
  };
  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  return (
    <div className={`admin-container ${isSidebarVisible ? "shifted" : ""}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <ReceptorNavbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? "shifted" : ""}`}>
        <TopBar userName="Administrador" />
        <section className="content">
        <div className="content-container">
          <h3 className="detalles-requisicion-header">Detalles de la Requisición</h3>

          <div className="detalles-requisicion-content">
            <div><strong>Usuario que realizó la Requisición:</strong> {requisicion.nombreUsuario}</div>
            <div><strong>Área solicitante:</strong> {requisicion.areaSolicitante}</div>
            <div><strong>Componente:</strong> {requisicion.componente}</div>
            <div><strong>Concepto:</strong> {requisicion.concepto}</div>
            <div><strong>Dirección de Adscripción:</strong> {requisicion.direccionAdscripcion}</div>
            <div><strong>Estatus:</strong> {requisicion.estatus}</div>
            <div><strong>Fecha de Elaboración:</strong> {requisicion.fechaElaboracion}</div>
            <div><strong>Fecha del Evento:</strong> {requisicion.fechaEvento}</div>
            <div><strong>Folio:</strong> {requisicion.folio}</div>
            <div><strong>Nombre del Evento:</strong> {requisicion.nombreEvento}</div>
          </div>

          <h4 className="tituloMateriales">Materiales/Servicios</h4>
          <div className="table-container-detalles">
            <table className="detalles-requisicion-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Precio Unitario</th>
                  <th>Concepto</th>
                  <th>Partida</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {requisicion.items &&
                  requisicion.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.unidad}</td>
                      <td>{item.precioUnitario}</td>
                      <td>{item.concepto}</td>
                      <td>{item.partida}</td>
                      <td>{item.subtotal}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="total-section-firmante">
            <strong>Total: </strong> {calcularTotal().toFixed(2)}
          </div>

          <h4>Firma del responsable</h4>
          <div className="detalles-firmas-solicitadas">
            {detallesFirmas.length > 0 ? (
              detallesFirmas.map((detalle, index) => (
                <div key={index} className="firma-card">
                  <p><strong>Acción:</strong> {detalle.accion}</p>
                  <p><strong>Código de Firma:</strong> {detalle.codigo}</p>
                  <p><strong>Fecha:</strong> {new Date(detalle.fechaFirma).toLocaleString()}</p>
                  <p><strong>Usuario:</strong> {detalle.nombreUsuario}</p>
                </div>
              ))
            ) : (
              <p>No hay firmas solicitadas para mostrar.</p>
            )}
          </div>

          {firmaValidada ? (
            <div className="firma-validada">
              <p>Código de Firma: {codigoFirma}</p>
            </div>
          ) : cargandoRequisicion ? (
            <div className="cargando">
              <p>Cargando...</p>
            </div>
          ) : requisicionFirmada ? (
            <div className="requisicion-firmada">
              <p>Esta requisición ya ha sido autorizada.</p>
            </div>
          ) : (
            <button className="firmar-button" onClick={abrirModal}>
              {firmaExistente ? "Firmar Requisición" : "Crear Firma"}
            </button>
          )}

          {modalVisible && (
            <div className="firma-modal">
              <div className="modal-content-firma">
                <h4>Introduzca su firma (5 dígitos)</h4>
                <input
                  type="text"
                  value={firma}
                  onChange={(e) => setFirma(e.target.value)}
                  maxLength={5}
                  placeholder="Ingrese su firma"
                />
                {mensajeError && <p className="error-message">{mensajeError}</p>}
                <button onClick={firmarRequisicion} className="confirmar-firma-button">
                  Confirmar Firma
                </button>
              </div>
            </div>
          )}
        </div>
          
        </section>

       
      </main>
    </div>
  );
}

export default RevisarRequisicion;
