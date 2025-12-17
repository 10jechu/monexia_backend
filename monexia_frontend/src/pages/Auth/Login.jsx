import React, { useState } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom'; // Añadimos Link
import { Lock, User, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const res = await api.post('/auth/token', formData);
      
      localStorage.setItem('token', res.data.access_token);
      
      // CAMBIO IMPORTANTE: Mandar al dashboard, no a la raíz
      navigate('/dashboard'); 
      
    } catch (err) {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 italic mb-2 tracking-tighter">MONEXIA</h1>
          <p className="text-slate-400 text-sm font-light">Bienvenido de nuevo, ingresa tus datos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-2">
              <User size={14} className="text-cyan-400"/> Usuario / Email
            </label>
            <input 
              type="text" 
              className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-cyan-400 transition-all placeholder:text-slate-600"
              placeholder="Ej: luisvilatu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-2">
              <Lock size={14} className="text-cyan-400"/> Contraseña
            </label>
            <input 
              type="password" 
              className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-cyan-400 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <LogIn size={20} /> ENTRAR AL SISTEMA
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-cyan-400 hover:underline font-bold">Crea una aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;