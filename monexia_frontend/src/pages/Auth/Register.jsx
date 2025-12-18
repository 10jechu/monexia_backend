import React, { useState } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData); 
      alert("Registro Exitoso");
      navigate('/login');
    } catch (err) { alert("Error en el registro."); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-md relative"
      >
        <div className="text-center mb-10">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <UserPlus className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter">ÚNETE A LA RED</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Protocolo de Registro</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input type="text" placeholder="NOMBRE COMPLETO" required className="w-full bg-[#1e293b] border border-slate-700 p-4 pl-12 rounded-2xl text-white focus:border-emerald-500 transition-all font-bold text-sm"
                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input type="email" placeholder="CORREO ELECTRÓNICO" required className="w-full bg-[#1e293b] border border-slate-700 p-4 pl-12 rounded-2xl text-white focus:border-emerald-500 transition-all font-bold text-sm"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
              <input type="password" placeholder="CONTRASEÑA" required className="w-full bg-[#1e293b] border border-slate-700 p-4 pl-12 rounded-2xl text-white focus:border-emerald-500 transition-all font-bold text-sm"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest mt-4">
            CONFIRMAR REGISTRO
          </button>
        </form>
        
        <p className="text-center text-slate-500 text-[11px] font-bold mt-8 uppercase tracking-tighter">
          ¿CUENTA ACTIVA? <Link to="/login" className="text-emerald-400 hover:underline transition-all">LOG IN</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;