const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Inicializa Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

app.post('/block-user', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    // Obtiene el usuario por correo electrónico
    const userRecord = await auth.getUserByEmail(email);

    // Bloquea el usuario
    await auth.updateUser(userRecord.uid, { disabled: true });

    res.status(200).send('User blocked successfully');
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).send('Error blocking user');
  }
});

const PORT = process.env.PORT || 3001; // Usa un puerto diferente al de tu aplicación React
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
