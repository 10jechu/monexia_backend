import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Wallet, TrendingDown, AlertCircle, Target, ArrowUpRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [resumen, setResumen] = useState({ 
    ingresos: 0, gastos: 0, deudas: 0, metas: 0, balance: 0, cantDeudas: 0 
  });

  const fetchTotals = async () => {
    try {
      const safeFetch = async (url) => {
        try { 
          const r = await api.get(url); 
          return Array.isArray(r.data) ? r.data : []; 
        } catch (e) { 
          console.error(`Error en ruta ${url}`, e); 
          return []; 
        }
      };

      const [rIng, rGas, rDeu, rMet] = await Promise.all([
        safeFetch('/ingresos/'),
        safeFetch('/gastos/'),
        safeFetch('/deudas/'),
        safeFetch('/metas/')
      ]);
      
      const totalI = rIng.reduce((a, b) => a + Number(b.monto || 0), 0);
      const totalG = rGas.reduce((a, b) => a + Number(b.monto || 0), 0);
      
      // Cálculo preciso basado en el monto_pendiente de PostgreSQL
      const totalD = rDeu.reduce((a, b) => a + Number(b.monto_pendiente || 0), 0);
      const totalM = rMet.reduce((a, b) => a + Number(b.monto_actual || 0), 0);

      setResumen({ 
        ingresos: totalI, 
        gastos: totalG, 
        deudas: totalD,
        metas: totalM,
        cantDeudas: rDeu.filter(d => Number(d.monto_pendiente) > 0).length,
        // El balance ahora refleja el sueldo disponible real
        balance: totalI - totalG - totalD
      });
    } catch (err) { 
      console.error("Error en Dashboard:", err); 
    }
  };

  useEffect(() => {
    fetchTotals();
    // Refresco automático para mantener los datos siempre al día sin F5
    const interval = setInterval(fetchTotals, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { 
      label: "Sueldo Disponible", 
      val: resumen.balance, 
      color: "text-green-400", 
      icon: Wallet, 
      bg: "bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.1)]" 
    },
    { 
      label: "Gastos Fijos", 
      val: resumen.gastos, 
      color: "text-rose-500", 
      icon: TrendingDown, 
      bg: "bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]" 
    },
    { 
      label: `${resumen.cantDeudas} Deudas Activas`, 
      val: resumen.deudas, 
      color: "text-orange-500", 
      icon: AlertCircle, 
      bg: "bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
    },
    { 
      label: "Ahorro en Metas", 
      val: resumen.metas, 
      color: "text-cyan-400", 
      icon: Target, 
      bg: "bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
    }
  ];

  return (
    <div className="p-8 space-y-10 bg-[#0f172a] min-h-screen">
      
      {/* HEADER LIMPIO Y ESTÉTICO */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="flex flex-col text-left"
      >
        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
          MONEXIA
        </h1>
        <div className="w-24 h-1.5 bg-orange-500 mt-2 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"></div>
      </motion.div>

      {/* GRID DE TARJETAS ACTUALIZADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((c, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-[#1e293b]/50 p-8 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group transition-all"
          >
            {/* Icono de fondo decorativo */}
            <div className={`absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform ${c.color}`}>
              <c.icon size={110} />
            </div>

            <div className="relative z-10 text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className={`${c.bg} ${c.color} p-4 rounded-2xl`}>
                  <c.icon size={26} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                  {c.label}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className={`text-4xl font-black ${c.color} tracking-tighter italic`}>
                  ${c.val.toLocaleString('es-CO')}
                </p>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className={`h-full opacity-40 ${c.color.replace('text', 'bg')}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETALLE FINAL */}
      <div className="pt-10 border-t border-slate-900 flex justify-center opacity-20">
         <Zap className="text-white animate-pulse" size={18} />
      </div>
    </div>
  );
};

export default Dashboard;