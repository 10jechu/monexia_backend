import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Wallet, TrendingDown, AlertCircle, Target, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [resumen, setResumen] = useState({ 
    ingresos: 0, gastos: 0, deudas: 0, metas: 0, balance: 0, cantDeudas: 0 
  });

  useEffect(() => {
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
          safeFetch('/gastos/'), // RUTA CORREGIDA según tu backend
          safeFetch('/deudas/'),
          safeFetch('/metas/')
        ]);
        
        const totalI = rIng.reduce((a, b) => a + Number(b.monto || 0), 0);
        const totalG = rGas.reduce((a, b) => a + Number(b.monto || 0), 0);
        const totalD = rDeu.reduce((a, b) => a + (Number(b.monto || 0) - Number(b.monto_pagado || 0)), 0);
        const totalM = rMet.reduce((a, b) => a + Number(b.monto_actual || 0), 0);

        setResumen({ 
          ingresos: totalI, 
          gastos: totalG, 
          deudas: totalD,
          metas: totalM,
          cantDeudas: rDeu.length,
          balance: totalI - totalG - totalD - totalM 
        });
      } catch (err) { console.error("Error en Dashboard:", err); }
    };
    fetchTotals();
  }, []);

  const cards = [
    { label: "Sueldo Disponible", val: resumen.balance, color: "text-green-400", icon: Wallet, bg: "bg-green-500/10" },
    { label: "Gastos Fijos", val: resumen.gastos, color: "text-rose-500", icon: TrendingDown, bg: "bg-rose-500/10" },
    { label: `${resumen.cantDeudas} Deudas Activas`, val: resumen.deudas, color: "text-amber-500", icon: AlertCircle, bg: "bg-amber-500/10" },
    { label: "Ahorro en Metas", val: resumen.metas, color: "text-cyan-400", icon: Target, bg: "bg-cyan-500/10" }
  ];

  return (
    <div className="p-8 space-y-8 bg-[#0f172a] min-h-screen">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-left">
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Monexia Dashboard</h1>
        <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Estado financiero en tiempo real</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5, rotate: 1 }}
            className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 ${c.color}`}><ArrowUpRight size={40}/></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`${c.bg} ${c.color} p-4 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform`}>
                <c.icon size={26} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.label}</span>
            </div>
            <p className={`text-3xl font-black ${c.color} relative z-10 tracking-tight`}>
              ${c.val.toLocaleString('es-CO')}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;