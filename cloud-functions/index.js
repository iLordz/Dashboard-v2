const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");
const functions = require("firebase-functions");

// Inicializar Firebase Admin SDK
initializeApp();

// Definir la función para eliminar el usuario
exports.eliminarUsuario = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario esté autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "El usuario no está autenticado.",
    );
  }

  const uid = data.uid; // Obtener el UID del usuario
  if (!uid) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Se requiere el UID del usuario.",
    );
  }

  try {
    // Eliminar datos en Firestore
    const db = getFirestore();
    await db.collection("usuarios").doc(uid).delete();

    // Eliminar el usuario en Firebase Authentication
    await getAuth().deleteUser(uid);

    return {message: "Usuario eliminado correctamente."};
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw new functions.https.HttpsError(
        "internal", "Hubo un error al eliminar el usuario.");
  }
});
