import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, TrendingUp, UserPlus, LogIn, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Fondo con Rayos de Luz y Malla */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/20 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse"></div>

      <div className="relative z-10 max-w-5xl text-center space-y-12">
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full mb-4">
            <Zap size={14} className="text-cyan-400 fill-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">V 2.0 - Finanzas Inteligentes</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">MONEX</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">IA</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            Domina tu flujo de dinero con una interfaz diseñada para el <span className="text-white font-bold underline decoration-cyan-500">futuro</span>.
          </p>
        </motion.header>

        {/* Grid de Beneficios con Hover 3D */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: "Análisis Real", color: "text-cyan-400", desc: "Gráficos de impacto inmediato." },
            { icon: ShieldCheck, title: "Cripto-Seguro", color: "text-emerald-400", desc: "Tus datos están blindados." },
            { icon: Wallet, title: "Metas Pro", color: "text-rose-400", desc: "Ahorra con gamificación." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, borderColor: 'rgba(255,255,255,0.2)' }}
              className="bg-[#0f172a]/80 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl transition-all"
            >
              <item.icon className={`${item.color} mb-4 mx-auto`} size={40} />
              <h3 className="font-black uppercase text-sm tracking-widest mb-2">{item.title}</h3>
              <p className="text-slate-500 text-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Botones Cyber-Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8"
        >
          <button 
            onClick={() => navigate('/login')}
            className="group relative w-full md:w-72 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 overflow-hidden transition-all hover:pr-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white">
              <LogIn size={20} /> ACCEDER AL PANEL
            </span>
            <ChevronRight className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all text-white" />
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="w-full md:w-72 bg-transparent border-2 border-slate-700 text-white hover:border-emerald-500 hover:text-emerald-400 font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus size={20} /> CREAR IDENTIDAD
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;