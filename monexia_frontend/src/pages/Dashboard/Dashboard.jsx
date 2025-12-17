import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Wallet, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, deudas: 0, balance: 0 });

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

        const [rIng, rGas, rDeu] = await Promise.all([
          safeFetch('/ingresos/'),
          safeFetch('/gastos-fijos/'),
          safeFetch('/deudas/')
        ]);
        
        // CORRECCIÓN PARA $NaN: Usar Number() y validación de nulidad
        const totalI = rIng.reduce((a, b) => a + Number(b.monto || 0), 0);
        const totalG = rGas.reduce((a, b) => a + Number(b.monto || 0), 0);
        const totalD = rDeu.reduce((a, b) => {
            const deudaTotal = Number(b.monto || 0);
            const pagado = Number(b.monto_pagado || 0);
            return a + (deudaTotal - pagado);
        }, 0);

        setResumen({ 
          ingresos: totalI, 
          gastos: totalG, 
          deudas: totalD, 
          balance: totalI - totalG - totalD // Balance real restando gastos y deudas
        });
      } catch (err) { console.error("Error en Dashboard:", err); }
    };
    fetchTotals();
  }, []);

  const cards = [
    { label: "Ingresos Totales", val: resumen.ingresos, color: "text-green-400", icon: Wallet, bg: "bg-green-500/10" },
    { label: "Gastos Fijos", val: resumen.gastos, color: "text-rose-500", icon: TrendingDown, bg: "bg-rose-500/10" },
    { label: "Deudas Pendientes", val: resumen.deudas, color: "text-amber-500", icon: AlertCircle, bg: "bg-amber-500/10" },
    { label: "Balance Disponible", val: resumen.balance, color: "text-cyan-400", icon: Target, bg: "bg-cyan-500/10" }
  ];

  return (
    <div className="p-8 space-y-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="text-left"
      >
        <h1 className="text-4xl font-black text-white tracking-tight">Resumen de Monexia</h1>
        <p className="text-slate-400 text-sm mt-1">Hola, así están tus finanzas hoy.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-[#1e293b] p-6 rounded-[2rem] border border-slate-700 shadow-xl relative overflow-hidden group"
          >
            {/* Efecto de luz al pasar el mouse */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${c.bg}`} />
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className={`${c.bg} ${c.color} p-4 rounded-2xl transition-all shadow-lg`}
              >
                <c.icon size={26} />
              </motion.div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">{c.label}</span>
            </div>
            
            <p className={`text-3xl font-black ${c.color} relative z-10`}>
              ${c.val.toLocaleString('es-CO')}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;