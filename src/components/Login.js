import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Asegúrate de que `db` sea la referencia a tu Firestore
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el rol del usuario desde Firestore
      const userDocRef = doc(db, 'users', user.uid); // Asumiendo que tienes una colección 'users' donde almacenas los roles
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role; // Asegúrate de que 'role' sea el campo correcto en Firestore

        // Llamar al callback onLogin y pasar el rol del usuario
        onLogin(user, role);

        // Redirigir según el rol
        if (role === 'admin') {
          navigate('/adminHome');
        } else {
          navigate('/login'); // Redirige a la página normal si no es admin
        }
      } else {
        setError('No se encontró el perfil del usuario.');
      }
    } catch (err) {
      setError('Error al iniciar sesión:  Su correo y/o contraseña no son validos');

    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="form-container">
          <div className="logo"></div>
          <h2>Accede con tu usuario y contraseña</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
      <div className="login-right">
        <h2>Sistema de requisiciones de materiales y/o servicios</h2>
        <div className="illustration"></div>
        <p className="footer-text">
          Universidad Tecnológica de la Riviera Maya<br />
          Organismo Público Descentralizado del Gobierno del Estado de Quintana Roo<br />
          Av. Paseos del Mayab 400, Playa del Carmen, Quintana Roo, C.P. 77710<br />
          Tel: 01 (984) 877 4 600
        </p>
      </div>
    </div>
  );
};

export default Login;
