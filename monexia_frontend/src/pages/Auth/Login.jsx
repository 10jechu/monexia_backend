import React, { useState } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, LogIn, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
      navigate('/dashboard'); 
    } catch (err) { alert("Credenciales inválidas."); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 text-cyan-400"><Shield size={100} /></div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">MONEX<span className="text-cyan-400">IA</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Auth Protocol 1.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-black ml-2 tracking-widest">User ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input type="text" className="w-full bg-[#1e293b] border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-black ml-2 tracking-widest">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input type="password" className="w-full bg-[#1e293b] border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 uppercase text-sm tracking-widest">
            <LogIn size={20} strokeWidth={3} /> Desbloquear
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-[11px] font-bold">
          ¿NUEVO AQUÍ? <Link to="/register" className="text-cyan-400 hover:text-white transition-colors underline underline-offset-4">INICIAR REGISTRO</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;