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

function Componentes() {
  const [componentes, setComponentes] = useState([]);
  const [codigoComponente, setCodigoComponente] = useState(""); // Estado para el código del componente
  const [descripcionComponente, setDescripcionComponente] = useState(""); // Estado para la descripción del componente
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentComponenteId, setCurrentComponenteId] = useState(null); // Guardar el componente actual en edición

  // Función para cargar los componentes desde Firestore
  const fetchComponentes = async () => {
    const querySnapshot = await getDocs(collection(db, "componentes")); // Asume que tienes una colección llamada 'componentes'
    const componentesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setComponentes(componentesList);
  };

  useEffect(() => {
    fetchComponentes(); // Carga los componentes al montar el componente
  }, []);

  // Función para agregar o editar un componente
  const handleSaveComponente = async () => {
    if (descripcionComponente && codigoComponente) {
      if (isEditing) {
        // Si estamos en modo edición, actualizamos el componente
        const componenteDoc = doc(db, "componentes", currentComponenteId);
        await updateDoc(componenteDoc, {
          descripcion: descripcionComponente,
          codigoComponente,
        });
        const updatedComponentes = componentes.map((componente) =>
          componente.id === currentComponenteId
            ? {
                ...componente,
                descripcion: descripcionComponente,
                codigoComponente,
              }
            : componente
        );
        setComponentes(updatedComponentes);
        Swal.fire(
          "¡Éxito!",
          "El componente ha sido actualizado correctamente.",
          "success"
        ); // Confirmación de edición
      } else {
        // Si estamos agregando un nuevo componente
        const docRef = await addDoc(collection(db, "componentes"), {
          descripcion: descripcionComponente,
          codigoComponente,
        });
        setComponentes([
          ...componentes,
          {
            id: docRef.id,
            descripcion: descripcionComponente,
            codigoComponente,
          },
        ]);

        // SweetAlert2 de confirmación
        Swal.fire({
          title: "¡Componente Agregado!",
          text: "El nuevo componente ha sido agregado correctamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      setDescripcionComponente(""); // Limpiar la descripción
      setCodigoComponente(""); // Limpiar el código
      setIsModalOpen(false); // Cerrar modal después de guardar
      setIsEditing(false); // Reiniciar el modo de edición
      setCurrentComponenteId(null); // Limpiar el componente actual en edición
    } else {
      Swal.fire("Error", "Por favor, completa todos los campos.", "error"); // Validación de campos
    }
  };

  // Función para eliminar un componente
  const handleDeleteComponente = async (id, descripcion) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el componente: ${descripcion}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d9534f",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "componentes", id));
      setComponentes(componentes.filter((componente) => componente.id !== id));
      Swal.fire(
        "¡Eliminado!",
        "El componente ha sido eliminado correctamente.",
        "success"
      );
    }
  };

  // Función para abrir el modal en modo de edición
  const handleEditComponente = (id, descripcion, codigo) => {
    setDescripcionComponente(descripcion); // Llenar el campo de entrada con la descripción existente
    setCodigoComponente(codigo); // Llenar el campo de entrada con el código existente
    setCurrentComponenteId(id); // Establecer el ID del componente que estamos editando
    setIsEditing(true); // Cambiar a modo de edición
    setIsModalOpen(true); // Abrir el modal
  };

  // Filtrar los componentes según el término de búsqueda
  const filteredComponentes = componentes.filter(
    (componente) =>
      componente.codigoComponente
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      componente.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="areas-container">
      <h1 className="areas-title">Componentes</h1>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar componente..."
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
          setDescripcionComponente(""); // Limpiar el campo de entrada
          setCodigoComponente(""); // Limpiar el código
        }}
      >
        Agregar Componente
      </button>

      {/* Modal para agregar o editar componente */}
      {isModalOpen && (
        <div className="modal-area">
          <div className="modal-content-area">
            <h2>
              {isEditing ? "Editar Componente" : "Agregar Nuevo Componente"}
            </h2>
            <input
              type="text"
              value={codigoComponente}
              onChange={(e) => setCodigoComponente(e.target.value)}
              placeholder="Código del componente"
              className="modal-input-area"
            />
            <input
              type="text"
              value={descripcionComponente}
              onChange={(e) => setDescripcionComponente(e.target.value)}
              placeholder="Descripción del componente"
              className="modal-input-area"
            />
            <div className="modal-buttons">
              <button className="modal-add-btn" onClick={handleSaveComponente}>
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
              <th>Código del Componente</th>{" "}
              {/* Columna para Código del Componente */}
              <th>Descripción del Componente</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filteredComponentes.map((componente) => (
              <tr key={componente.id}>
                <td>{componente.codigoComponente}</td>{" "}
                {/* Celda para el código */}
                <td>{componente.descripcion}</td>
                <td className="details-cell">
                  <button
                    className="edit-btn-area"
                    onClick={() =>
                      handleEditComponente(
                        componente.id,
                        componente.descripcion,
                        componente.codigoComponente
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                    className="delete-btn-area"
                    onClick={() =>
                      handleDeleteComponente(
                        componente.id,
                        componente.descripcion
                      )
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

export default Componentes;
