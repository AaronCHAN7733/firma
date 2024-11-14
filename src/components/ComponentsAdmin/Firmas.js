import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import Modal from "react-modal";
import Swal from "sweetalert2";
import Navbar from "../Navbar";
import TopBar from "../TopBar";
import "../../styles/Usuarios.css";
import { faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

Modal.setAppElement("#root");

function Firmas({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [firmasData, setFirmasData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFirma, setSelectedFirma] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [visibleInfo, setVisibleInfo] = useState({}); // Estado para manejar la visibilidad de los detalles

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const toggleMoreInfo = (firmaId) => {
    setVisibleInfo((prev) => ({
      ...prev,
      [firmaId]: !prev[firmaId],
    }));
  };

  useEffect(() => {
    const fetchFirmasData = async () => {
      try {
        const firmasSnapshot = await getDocs(collection(db, "firmas"));
        const firmasPromises = firmasSnapshot.docs.map(async (firmaDoc) => {
          const firmaData = firmaDoc.data();

          const userDoc = await getDoc(doc(db, "users", firmaData.usuarioId));
          const userData = userDoc.data();

          const areaDoc = await getDoc(doc(db, "areas", userData.areaId));
          const areaData = areaDoc.data();

          const direccionDoc = await getDoc(
            doc(db, "direcciones", userData.direccionId)
          );
          const direccionData = direccionDoc.data();

          return {
            id: firmaDoc.id,
            nombre: userData.nombre,
            role: userData.role,
            direccion: direccionData.descripcion,
            area: areaData.descripcion,
            codigoDeFirma: firmaData.codigo,
            estado: firmaData.estado,
          };
        });

        const resolvedFirmasData = await Promise.all(firmasPromises);
        setFirmasData(resolvedFirmasData);
      } catch (error) {
        console.error("Error fetching firmas data:", error);
      }
    };

    fetchFirmasData();
  }, []);

  const openModal = (firma) => {
    setSelectedFirma(firma);
    setNewEstado(firma.estado);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFirma(null);
  };

  const handleEstadoChange = (e) => {
    setNewEstado(e.target.value);
  };

  const handleSave = async () => {
    if (selectedFirma) {
      try {
        const firmaRef = doc(db, "firmas", selectedFirma.id);
        await updateDoc(firmaRef, { estado: newEstado });

        setFirmasData((prevFirmas) =>
          prevFirmas.map((firma) =>
            firma.id === selectedFirma.id
              ? { ...firma, estado: newEstado }
              : firma
          )
        );

        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "El estado de la firma ha sido actualizado.",
          timer: 2000,
          showConfirmButton: false,
        });

        closeModal();
      } catch (error) {
        console.error("Error updating firma:", error);
      }
    }
  };

  const handleDelete = async (firmaId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "firmas", firmaId));

          setFirmasData((prevFirmas) =>
            prevFirmas.filter((firma) => firma.id !== firmaId)
          );

          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "La firma ha sido eliminada.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error deleting firma:", error);
        }
      }
    });
  };

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
          <div className="content-container">
            <h1>Validaciones</h1>
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Dirección</th>
                    <th>Área</th>
                    <th>Código de Firma</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {firmasData.map((firma, index) => (
                    <React.Fragment key={firma.id}>
                      <tr>
                        <td>
                          {firma.nombre}
                          <span
                            className="more-info"
                            onClick={() => toggleMoreInfo(firma.id)}
                          >
                            ➕
                          </span>
                        </td>
                        <td>{firma.role}</td>
                        <td>{firma.direccion}</td>
                        <td>{firma.area}</td>
                        <td>{firma.codigoDeFirma}</td>
                        <td>{firma.estado}</td>
                        <td>
                          <button onClick={() => openModal(firma)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button onClick={() => handleDelete(firma.id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                      {visibleInfo[firma.id] && (
                        <tr className="extra-info-row">
                          <td colSpan="7">
                            <div className="extra-info">
                              <p>
                                <strong>Nombre:</strong> {firma.nombre}
                              </p>
                              <p>
                                <strong>Rol:</strong> {firma.role}
                              </p>
                              <p>
                                <strong>Dirección:</strong> {firma.direccion}
                              </p>
                              <p>
                                <strong>Área:</strong> {firma.area}
                              </p>
                              <p>
                                <strong>Código de Firma:</strong>{" "}
                                {firma.codigoDeFirma}
                              </p>
                              <p>
                                <strong>Estado:</strong> {firma.estado}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal para editar el estado */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="Modal-user"
          overlayClassName="ReactModal__Overlay"
        >
          <h2>Editar Estado de Firma</h2>
          <form>
            <label htmlFor="estado">Estado</label>
            <select id="estado" value={newEstado} onChange={handleEstadoChange}>
              <option value="autorizado">Autorizar</option>
              <option value="denegado">Denegar</option>
            </select>
          </form>
          <div className="modal-buttons">
            <button onClick={handleSave}>Guardar</button>
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Firmas;
