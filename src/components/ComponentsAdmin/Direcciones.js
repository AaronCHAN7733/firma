import React, { useState, useEffect } from "react";
import "../../styles/Areas.css"; // Reutilizamos el mismo archivo de estilos
import { db } from "../../firebase"; // Importa tu configuración de Firebase
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Swal from "sweetalert2"; // Importa SweetAlert2
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

function Direcciones() {
  const [direcciones, setDirecciones] = useState([]);
  const [newDireccion, setNewDireccion] = useState("");
  const [newClaveUR, setNewClaveUR] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentDireccionId, setCurrentDireccionId] = useState(null); // Guardar la dirección actual en edición
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el valor de búsqueda

  // Función para cargar las direcciones desde Firestore
  const fetchDirecciones = async () => {
    const querySnapshot = await getDocs(collection(db, "direcciones")); // Asume que tienes una colección llamada 'direcciones'
    const direccionesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar las direcciones por claveUR de menor a mayor
    const sortedDirecciones = direccionesList.sort((a, b) =>
      a.claveUR.localeCompare(b.claveUR)
    );

    setDirecciones(sortedDirecciones);
  };

  useEffect(() => {
    fetchDirecciones(); // Carga las direcciones al montar el componente
  }, []);

  // Función para agregar o editar una dirección
  const handleSaveDireccion = async () => {
    if (newDireccion && newClaveUR) {
      if (isEditing) {
        // Si estamos en modo edición, actualizamos la dirección
        const direccionDoc = doc(db, "direcciones", currentDireccionId);
        await updateDoc(direccionDoc, {
          descripcion: newDireccion,
          claveUR: newClaveUR,
        });

        // Actualizar la lista de direcciones y ordenar
        const updatedDirecciones = direcciones
          .map((direccion) =>
            direccion.id === currentDireccionId
              ? { ...direccion, descripcion: newDireccion, claveUR: newClaveUR }
              : direccion
          )
          .sort((a, b) => a.claveUR.localeCompare(b.claveUR));

        setDirecciones(updatedDirecciones);
        Swal.fire(
          "¡Éxito!",
          "La dirección ha sido actualizada correctamente.",
          "success"
        ); // Confirmación de edición
      } else {
        // Si estamos agregando una nueva dirección
        const docRef = await addDoc(collection(db, "direcciones"), {
          descripcion: newDireccion,
          claveUR: newClaveUR,
        });

        // Añadir la nueva dirección y ordenar
        const newDirecciones = [
          ...direcciones,
          { id: docRef.id, descripcion: newDireccion, claveUR: newClaveUR },
        ].sort((a, b) => a.claveUR.localeCompare(b.claveUR));

        setDirecciones(newDirecciones);

        // SweetAlert2 de confirmación
        Swal.fire({
          title: "¡Dirección Agregada!",
          text: "La nueva dirección ha sido agregada correctamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      setNewDireccion(""); // Limpiar el input
      setNewClaveUR(""); // Limpiar el input
      setIsModalOpen(false); // Cerrar modal después de guardar
      setIsEditing(false); // Reiniciar el modo de edición
      setCurrentDireccionId(null); // Limpiar la dirección actual en edición
    }
  };

  // Función para eliminar una dirección
  const handleDeleteDireccion = async (id, descripcion) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar la dirección: ${descripcion}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d9534f",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "direcciones", id));

      // Eliminar la dirección y ordenar
      const updatedDirecciones = direcciones
        .filter((direccion) => direccion.id !== id)
        .sort((a, b) => a.claveUR.localeCompare(b.claveUR));

      setDirecciones(updatedDirecciones);
      Swal.fire(
        "¡Eliminado!",
        "La dirección ha sido eliminada correctamente.",
        "success"
      );
    }
  };

  // Función para abrir el modal en modo de edición
  const handleEditDireccion = (id, descripcion, claveUR) => {
    setNewDireccion(descripcion); // Llenar el campo de entrada con la descripción existente
    setNewClaveUR(claveUR); // Llenar el campo de entrada con el número existente
    setCurrentDireccionId(id); // Establecer el ID de la dirección que estamos editando
    setIsEditing(true); // Cambiar a modo de edición
    setIsModalOpen(true); // Abrir el modal
  };

  // Filtrar direcciones en base al término de búsqueda
  const filteredDirecciones = direcciones.filter(
    (direccion) =>
      direccion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      direccion.claveUR.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="areas-container">
      <h1 className="areas-title">Direcciones</h1>

      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar direccion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Botón para abrir el modal en modo agregar */}
      <button
        className="add-area-btn"
        onClick={() => {
          setIsModalOpen(true);
          setIsEditing(false); // Modo agregar
          setNewDireccion(""); // Limpiar el campo de entrada
          setNewClaveUR(""); // Limpiar el campo de entrada
        }}
      >
        Agregar Dirección
      </button>

      {/* Modal para agregar o editar dirección */}
      {isModalOpen && (
        <div className="modal-area">
          <div className="modal-content-area">
            <h2>
              {isEditing ? "Editar Dirección" : "Agregar Nueva Dirección"}
            </h2>
            <input
              type="text"
              value={newClaveUR}
              onChange={(e) => setNewClaveUR(e.target.value)}
              placeholder="Clave UR"
              className="modal-input-area"
            />
            <input
              type="text"
              value={newDireccion}
              onChange={(e) => setNewDireccion(e.target.value)}
              placeholder="Descripción de la dirección"
              className="modal-input-area"
            />
            <div className="modal-buttons">
              <button className="modal-add-btn" onClick={handleSaveDireccion}>
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
              <th>Clave UR</th>
              <th>Descripción de la Dirección</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filteredDirecciones.map((direccion) => (
              <tr key={direccion.id}>
                <td>{direccion.claveUR}</td>
                <td>{direccion.descripcion}</td>
                <td className="details-cell">
                  <button
                    className="edit-btn-area"
                    onClick={() =>
                      handleEditDireccion(
                        direccion.id,
                        direccion.descripcion,
                        direccion.claveUR
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                    className="delete-btn-area"
                    onClick={() =>
                      handleDeleteDireccion(direccion.id, direccion.descripcion)
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Direcciones;
