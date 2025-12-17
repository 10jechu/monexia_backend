import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, TrendingUp, UserPlus, LogIn } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Círculos de fondo decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-4xl text-center space-y-8">
        <header className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-sm">
            MONEXIA
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light tracking-wide">
            El control total de tus finanzas familiares empieza aquí.
          </p>
        </header>

        {/* Tarjetas de Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
          <div className="bg-[#1e293b]/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <TrendingUp className="text-cyan-400 mb-4 mx-auto" size={40} />
            <h3 className="font-bold">Control de Ingresos</h3>
          </div>
          <div className="bg-[#1e293b]/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <ShieldCheck className="text-emerald-400 mb-4 mx-auto" size={40} />
            <h3 className="font-bold">Seguridad Total</h3>
          </div>
          <div className="bg-[#1e293b]/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <Wallet className="text-rose-400 mb-4 mx-auto" size={40} />
            <h3 className="font-bold">Metas de Ahorro</h3>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full md:w-64 bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20 text-lg"
          >
            <LogIn size={24} /> INICIAR SESIÓN
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="w-full md:w-64 bg-transparent border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 text-lg"
          >
            <UserPlus size={24} /> CREAR CUENTA
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;