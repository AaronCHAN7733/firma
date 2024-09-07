// src/components/Firma.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';  // Agregar getDoc para verificar si ya existe una clave
import { encryptData } from '../utils/encryption';
import '../styles/Firma.css';

const Firma = ({ user }) => {
  const [clave, setClave] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [claveGuardada, setClaveGuardada] = useState(false);  // Para verificar si ya existe una clave

  // useEffect para verificar si el usuario ya tiene una clave guardada
  useEffect(() => {
    const verificarClaveGuardada = async () => {
      const docRef = doc(db, 'firmas', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Si ya hay una clave en la base de datos, no permitir crear una nueva
        setClaveGuardada(true);
      }
    };

    verificarClaveGuardada();
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que la clave sea de 4 dígitos
    if (!/^\d{4}$/.test(clave)) {
      setMensaje('La clave debe tener exactamente 4 dígitos.');
      return;
    }

    if (claveGuardada) {
      setMensaje('Ya tienes una clave guardada. No puedes crear otra.');
      return;
    }

    try {
      // Encriptar la clave
      const claveEncriptada = await encryptData(clave);

      // Guardar la clave en Firestore
      await setDoc(doc(db, 'firmas', user.uid), {
        clave: claveEncriptada,
      });

      setMensaje('¡Clave guardada exitosamente!');
      setClaveGuardada(true);  // Indicar que la clave ya fue guardada
      setClave('');
    } catch (error) {
      console.error('Error al guardar la clave:', error);
      setMensaje('Hubo un error al guardar la clave.');
    }
  };

  return (
    <div className="firma-container">
      <h2>Crear Clave Personal</h2>
      {claveGuardada ? (
        <p>Ya tienes una clave guardada. No puedes crear otra.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="clave">Ingresa tu clave de 4 dígitos:</label>
          <input
            type="text"
            id="clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            maxLength="4"
            required
          />
          <button type="submit">Guardar Clave</button>
        </form>
      )}
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default Firma;
