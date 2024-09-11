import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';  // Importamos el componente Navbar
import TopBar from './TopBar';  // Importamos el componente TopBar
import '../styles/Usuarios.css';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Importa correctamente la base de datos de firebase
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Importar autenticación de Firebase
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Para accesibilidad

function Usuarios({ user }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    correo: '',
    nombre: '',
    role: '',
    telefono: '',
    password: ''  // Incluimos el campo de contraseña para agregar usuarios
  });

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usersList);
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.correo, newUser.password);
      const userId = userCredential.user.uid;

      await addDoc(collection(db, 'users'), {
        uid: userId,
        correo: newUser.correo,
        nombre: newUser.nombre,
        role: newUser.role,
        telefono: newUser.telefono
      });

      setModalIsOpen(false);
      setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '' });

      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usersList);
    } catch (error) {
      console.error("Error al crear el usuario: ", error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalIsOpen(true);
    setNewUser({ ...user, password: '' }); // El campo de la contraseña se deja vacío para la edición
  };

  const handleUpdateUser = async () => {
    const userDocRef = doc(db, 'users', editingUser.id);
    await updateDoc(userDocRef, {
      nombre: newUser.nombre,
      role: newUser.role,
      telefono: newUser.telefono
    });
    setEditingUser(null);
    setModalIsOpen(false);
    setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '' });

    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsuarios(usersList);
  };

  const handleDeleteUser = async (id) => {
    const userDocRef = doc(db, 'users', id);
    await deleteDoc(userDocRef);
    setUsuarios(usuarios.filter(user => user.id !== id));
  };

  const openModal = () => {
    setModalIsOpen(true);
    setEditingUser(null);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewUser({ correo: '', nombre: '', role: '', telefono: '', password: '' });
  };

  return (
    <div className={`admin-container ${isSidebarVisible ? 'shifted' : ''}`}>
      <button className={`hamburger-btn ${isSidebarVisible ? 'shifted' : ''}`} onClick={toggleSidebar}>
        ☰
      </button>

      <Navbar isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      <main className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
        <TopBar userName="Administrador" />

        <section className="content">
          <button className="add-user-btn" onClick={openModal}>Agregar Usuario</button>

          <table className="user-table">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id}>
                  <td>{user.correo}</td>
                  <td>{user.nombre}</td>
                  <td>{user.role}</td>
                  <td>{user.telefono}</td>
                  <td>
                    <button onClick={() => handleEditUser(user)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  contentLabel="Formulario de Usuario"
  className="Modal"
  style={{
    overlay: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'  // Agrega un fondo oscuro semi-transparente
    },
    content: {
      position: 'relative',  // Para que no sobrescriba el posicionamiento
      maxWidth: '400px',     // Limitar el ancho del modal
      width: '100%',         // Asegurarse de que ocupe el 100% del contenedor disponible
      padding: '20px',
      borderRadius: '10px',
      backgroundColor: '#e1f0fb', // Celeste claro
    }
  }}
>
  <h2>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
  <form>
    <label>
      Correo:
      <input
        type="email"
        value={newUser.correo}
        onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
        disabled={!!editingUser}  // Deshabilitar el campo correo si está editando un usuario
      />
    </label>
    <label>
      Nombre:
      <input
        type="text"
        value={newUser.nombre}
        onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
      />
    </label>
    <label>
      Rol:
      <input
        type="text"
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      />
    </label>
    <label>
      Teléfono:
      <input
        type="text"
        value={newUser.telefono}
        onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
      />
    </label>
    {!editingUser && (  // Mostrar el campo de contraseña solo si estamos agregando un nuevo usuario
      <label>
        Contraseña:
        <input
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
      </label>
    )}
  </form>
  <button onClick={editingUser ? handleUpdateUser : handleAddUser}>
    {editingUser ? 'Actualizar' : 'Agregar'}
  </button>
  <button className="close" onClick={closeModal}>Cerrar</button>
</Modal>


        </section>
      </main>
    </div>
  );
}

export default Usuarios;