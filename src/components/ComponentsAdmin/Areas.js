import React, { useState, useEffect } from "react";
import "../../styles/Areas.css";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

function Areas() {
  const [areas, setAreas] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [newArea, setNewArea] = useState("");
  const [selectedDireccion, setSelectedDireccion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAreaId, setCurrentAreaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10); // Estado para manejar las áreas por página
  const [currentPage, setCurrentPage] = useState(1); // Estado para manejar la página actual

  const fetchAreas = async () => {
    const querySnapshot = await getDocs(collection(db, "areas"));
    const areasList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAreas(areasList);
  };

  const fetchDirecciones = async () => {
    const querySnapshot = await getDocs(collection(db, "direcciones"));
    const direccionesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDirecciones(direccionesList);
  };

  useEffect(() => {
    fetchAreas();
    fetchDirecciones();
  }, []);

  const handleSaveArea = async () => {
    if (newArea && selectedDireccion) {
      if (isEditing) {
        const areaDoc = doc(db, "areas", currentAreaId);
        await updateDoc(areaDoc, {
          descripcion: newArea,
          direccionId: selectedDireccion,
        });
        const updatedAreas = areas.map((area) =>
          area.id === currentAreaId
            ? { ...area, descripcion: newArea, direccionId: selectedDireccion }
            : area
        );
        setAreas(updatedAreas);
        Swal.fire(
          "¡Éxito!",
          "El área ha sido actualizada correctamente.",
          "success"
        );
      } else {
        const docRef = await addDoc(collection(db, "areas"), {
          descripcion: newArea,
          direccionId: selectedDireccion,
        });
        setAreas([
          ...areas,
          {
            id: docRef.id,
            descripcion: newArea,
            direccionId: selectedDireccion,
          },
        ]);
        Swal.fire({
          title: "¡Área Agregada!",
          text: "La nueva área ha sido agregada correctamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      setNewArea("");
      setSelectedDireccion("");
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentAreaId(null);
    }
  };

  const handleDeleteArea = async (id, descripcion) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el área: ${descripcion}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d9534f",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "areas", id));
      setAreas(areas.filter((area) => area.id !== id));
      Swal.fire(
        "¡Eliminado!",
        "El área ha sido eliminada correctamente.",
        "success"
      );
    }
  };

  const handleEditArea = (id, descripcion, direccionId) => {
    setNewArea(descripcion);
    setSelectedDireccion(direccionId);
    setCurrentAreaId(id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const filteredAreas = areas.filter((area) =>
    area.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAreas = filteredAreas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="content-container">
      <div className="header-areas">
        <h1 className="areas-title">Áreas</h1>
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <button
        className="add-area-btn"
        onClick={() => {
          setIsModalOpen(true);
          setIsEditing(false);
          setNewArea("");
          setSelectedDireccion("");
        }}
      >
        Agregar Área
      </button>

      {/* Selector para áreas por página */}
      <div className="items-per-page-container">
        <label htmlFor="itemsPerPage">Mostrar: </label>
        <select
          id="itemsPerPage"
          className="select-mostrar-datos"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={filteredAreas.length}>Todos</option>
        </select>
      </div>

      {isModalOpen && (
        <div className="modal-area">
          <div className="modal-content-area">
            <h2>{isEditing ? "Editar Área" : "Agregar Nueva Área"}</h2>
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Nombre del área"
              className="modal-input-area"
            />
            <select
              value={selectedDireccion}
              onChange={(e) => setSelectedDireccion(e.target.value)}
              className="modal-input-area"
            >
              <option value="">Selecciona una dirección</option>
              {direcciones.map((direccion) => (
                <option key={direccion.id} value={direccion.id}>
                  {direccion.descripcion}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button className="modal-add-btn" onClick={handleSaveArea}>
                {isEditing ? "Guardar Cambios" : "Agregar"}
              </button>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      <div class="table-scroll-container">
        <table className="areas-table">
          <thead>
            <tr>
              <th>Descripción del Área</th>
              <th>Dirección</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAreas.map((area) => {
              const direccion = direcciones.find(
                (direccion) => direccion.id === area.direccionId
              );
              return (
                <tr key={area.id}>
                  <td>{area.descripcion}</td>
                  <td>
                    {direccion
                      ? `${direccion.claveUR} ${direccion.descripcion}`
                      : "Sin dirección"}
                  </td>
                  <td className="details-cell">
                    <button
                      className="edit-btn-area"
                      onClick={() =>
                        handleEditArea(
                          area.id,
                          area.descripcion,
                          area.direccionId
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="delete-btn-area"
                      onClick={() =>
                        handleDeleteArea(area.id, area.descripcion)
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Areas;
