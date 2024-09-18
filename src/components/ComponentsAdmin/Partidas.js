import React, { useState, useEffect } from 'react';
import '../../styles/Areas.css'; // Reutilizamos el mismo archivo de estilos
import { db } from '../../firebase'; // Importa tu configuración de Firebase
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2'; // Importa SweetAlert2

function Partidas() {
  const [partidas, setPartidas] = useState([]);
  const [newPartida, setNewPartida] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentPartidaId, setCurrentPartidaId] = useState(null); // Guardar la partida actual en edición

  // Función para cargar las partidas desde Firestore
  const fetchPartidas = async () => {
    const querySnapshot = await getDocs(collection(db, 'partidas')); // Asume que tienes una colección llamada 'partidas'
    const partidasList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPartidas(partidasList);
  };

  useEffect(() => {
    fetchPartidas(); // Carga las partidas al montar el componente
  }, []);

  // Función para agregar o editar una partida
  const handleSavePartida = async () => {
    if (newPartida) {
      if (isEditing) {
        // Si estamos en modo edición, actualizamos la partida
        const partidaDoc = doc(db, 'partidas', currentPartidaId);
        await updateDoc(partidaDoc, { descripcion: newPartida });
        const updatedPartidas = partidas.map((partida) =>
          partida.id === currentPartidaId ? { ...partida, descripcion: newPartida } : partida
        );
        setPartidas(updatedPartidas);
        Swal.fire('¡Éxito!', 'La partida ha sido actualizada correctamente.', 'success'); // Confirmación de edición
      } else {
        // Si estamos agregando una nueva partida
        const docRef = await addDoc(collection(db, 'partidas'), { descripcion: newPartida });
        setPartidas([...partidas, { id: docRef.id, descripcion: newPartida }]);

        // SweetAlert2 de confirmación
        Swal.fire({
          title: '¡Partida Agregada!',
          text: 'La nueva partida ha sido agregada correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }

      setNewPartida(''); // Limpiar el input
      setIsModalOpen(false); // Cerrar modal después de guardar
      setIsEditing(false); // Reiniciar el modo de edición
      setCurrentPartidaId(null); // Limpiar la partida actual en edición
    }
  };

  // Función para eliminar una partida
  const handleDeletePartida = async (id, descripcion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar la partida: ${descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d9534f',
      cancelButtonColor: '#6c757d',
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, 'partidas', id));
      setPartidas(partidas.filter((partida) => partida.id !== id));
      Swal.fire('¡Eliminado!', 'La partida ha sido eliminada correctamente.', 'success');
    }
  };

  // Función para abrir el modal en modo de edición
  const handleEditPartida = (id, descripcion) => {
    setNewPartida(descripcion); // Llenar el campo de entrada con la descripción existente
    setCurrentPartidaId(id); // Establecer el ID de la partida que estamos editando
    setIsEditing(true); // Cambiar a modo de edición
    setIsModalOpen(true); // Abrir el modal
  };

  return (
    <div className="areas-container">
      <h1 className="areas-title">Partidas</h1>

      {/* Botón para abrir el modal en modo agregar */}
      <button className="add-area-btn" onClick={() => {
        setIsModalOpen(true);
        setIsEditing(false); // Modo agregar
        setNewPartida(''); // Limpiar el campo de entrada
      }}>Agregar Partida</button>

      {/* Modal para agregar o editar partida */}
      {isModalOpen && (
        <div className="modal-area">
          <div className="modal-content-area">
            <h2>{isEditing ? 'Editar Partida' : 'Agregar Nueva Partida'}</h2>
            <input
              type="text"
              value={newPartida}
              onChange={(e) => setNewPartida(e.target.value)}
              placeholder="Descripción de la partida"
              className="modal-input-area"
            />
            <div className="modal-buttons">
              <button className="modal-add-btn" onClick={handleSavePartida}>
                {isEditing ? 'Guardar Cambios' : 'Agregar'}
              </button>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <table className="areas-table">
        <thead>
          <tr>
            <th>Descripción de la Partida</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {partidas.map((partida) => (
            <tr key={partida.id}>
              <td>{partida.descripcion}</td>
              <td className="details-cell">
                <button
                  className="edit-btn-area"
                  onClick={() => handleEditPartida(partida.id, partida.descripcion)}
                >
                  Editar
                </button>
                <button
                  className="delete-btn-area"
                  onClick={() => handleDeletePartida(partida.id, partida.descripcion)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Partidas;
