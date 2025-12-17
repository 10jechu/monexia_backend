import React, { useState } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',    // Cambiado de 'nombre_completo' a 'nombre' para coincidir con tu modelo
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Enviamos el objeto con 'nombre', 'email' y 'password'
      await api.post('/auth/register', formData); 
      alert("¡Usuario creado con éxito! Ahora puedes iniciar sesión.");
      navigate('/login');
    } catch (err) {
      // Si el error es 422, es porque falta un campo o el nombre está mal escrito
      if (err.response?.status === 422) {
        console.error("Detalles del error 422:", err.response.data.detail);
        alert("Error de validación: Asegúrate de completar todos los campos correctamente.");
      } else {
        alert("Error al registrar: Puede que el correo ya exista.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-400 mb-2 font-mono italic">CREAR CUENTA</h2>
          <p className="text-slate-400 text-sm italic underline underline-offset-4 decoration-emerald-500/50">Regístrate en Monexia</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Nombre Completo</label>
            <input 
              type="text" 
              required 
              className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-emerald-400 outline-none transition-all"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-emerald-400 outline-none transition-all"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Contraseña</label>
            <input 
              type="password" 
              required 
              className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white focus:border-emerald-400 outline-none transition-all"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0f172a] font-black py-3 rounded-xl flex justify-center items-center gap-2 transition-all mt-4 shadow-lg shadow-emerald-500/20 active:scale-95">
            <UserPlus size={20} /> REGISTRARSE
          </button>
        </form>
        
        <p className="text-center text-slate-500 text-sm mt-6">
          ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-400 hover:underline font-bold">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;