 import React, { useState, useEffect } from 'react';
 import appFirebase from '../credenciales';
 import { getAuth } from 'firebase/auth';
 import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
 const auth = getAuth(appFirebase);
 const firestore = getFirestore(appFirebase)
 const Perfil = () => {
     const [usuario, setUsuario] = useState({});
     const [editando, setEditando] = useState(false);
     const [formData, setFormData] = useState({
         nombre: '',
         apellidos: '',
         correo: ''
     })
     // Obtener los datos del usuario al cargar la página
     useEffect(() => {
         const obtenerDatosUsuario = async () => {
             try {
                 const user = auth.currentUser;
                 if (user) {
                     const docuRef = doc(firestore, `usuarios/${user.uid}`);
                     const docuSnap = await getDoc(docuRef);
                     if (docuSnap.exists()) {
                         setUsuario(docuSnap.data());
                         setFormData(docuSnap.data());
                     } else {
                         console.error('El documento no existe');
                     }
                 }
             } catch (error) {
                 console.error('Error al obtener datos del usuario:', error);
             }
         }
         obtenerDatosUsuario();
     }, [])
     // Manejar cambios en el formulario
     const handleChange = (e) => {
         setFormData({
             ...formData,
             [e.target.name]: e.target.value
         });
     }
     // Actualizar datos en Firebase
     const handleGuardar = async () => {
         try {
             const user = auth.currentUser;
             if (user) {
                 const docuRef = doc(firestore, `usuarios/${user.uid}`);
                 await updateDoc(docuRef, formData);
                 setUsuario(formData);
                 setEditando(false);
                 alert('Datos actualizados correctamente');
             }
         } catch (error) {
             console.error('Error al actualizar los datos:', error);
             alert('Hubo un error al actualizar los datos');
         }
     }
     return (
         <div className="container mt-4">
             <h1>Perfil del Usuario</h1>
             {!editando ? (
                 <div>
                     <p><strong>Nombre:</strong> {usuario.nombre}</p>
                     <p><strong>Apellido:</strong> {usuario.apellidos}</p>
                     <p><strong>Correo:</strong> {usuario.correo}</p>
                     <button className="btn btn-primary" onClick={() => setEditando(true)}>Editar Perfil</button>
                 </div>
             ) : (
                 <div>
                     <div className="mb-3">
                         <label className="form-label">Nombre</label>
                         <input
                             type="text"
                             className="form-control"
                             name="nombre"
                             value={formData.nombre}
                             onChange={handleChange}
                         />
                     </div>
                     <div className="mb-3">
                         <label className="form-label">Apellido</label>
                         <input
                             type="text"
                             className="form-control"
                             name="apellidos"
                             value={formData.apellidos}
                             onChange={handleChange}
                         />
                     </div>
                     <div className="mb-3">
                         <label className="form-label">Correo</label>
                         <input
                             type="email"
                             className="form-control"
                             name="correo"
                             value={formData.correo}
                             onChange={handleChange}
                             disabled
                         />
                     </div>
                     <button className="btn btn-success" onClick={handleGuardar}>Guardar Cambios</button>
                     <button className="btn btn-secondary ms-2" onClick={() => setEditando(false)}>Cancelar</button>
                 </div>
             )}
         </div>
     );
 }
 export default Perfil;
