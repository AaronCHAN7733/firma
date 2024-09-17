const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

exports.enviarCorreoFirmante = functions.firestore
  .document('requisiciones/{requisicionId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { estatus, userId } = data;

    if (estatus === 'En Firma') {
      try {
        // Obtener el correo del firmante desde Firestore
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firmanteEmail = userData.email;  // Asumiendo que el campo de correo es 'email'

          // Configurar el correo
          const mailOptions = {
            from: 'tu-correo@gmail.com',
            to: firmanteEmail,
            subject: 'Nueva Requisición para Firmar',
            text: `Hola, hay una nueva requisición que necesita tu firma. Por favor, revisa el documento.`,
          };

          // Enviar el correo
          await transporter.sendMail(mailOptions);
          console.log('Correo enviado a:', firmanteEmail);
        } else {
          console.error('No se encontró el documento del firmante');
        }
      } catch (error) {
        console.error('Error al enviar correo:', error);
      }
    }
  });
