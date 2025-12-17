import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Wallet, TrendingDown, Target, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 });

  useEffect(() => {
    const calcularResumen = async () => {
      try {
        const [ing, gas] = await Promise.all([api.get('/ingresos/'), api.get('/gastos/')]);
        const totalIng = ing.data.reduce((acc, curr) => acc + curr.monto, 0);
        const totalGas = gas.data.reduce((acc, curr) => acc + curr.monto, 0);
        setResumen({ 
          ingresos: totalIng, 
          gastos: totalGas, 
          balance: totalIng - totalGas 
        });
      } catch (err) { console.error(err); }
    };
    calcularResumen();
  }, []);

  const tarjetas = [
    { t: 'Ingresos Totales', v: resumen.ingresos, c: 'text-green-400', i: <Wallet/> },
    { t: 'Gastos Totales', v: resumen.gastos, c: 'text-rose-400', i: <TrendingDown/> },
    { t: 'Balance Familiar', v: resumen.balance, c: 'text-cyan-400', i: <Target/> },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Resumen de Monexia</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tarjetas.map((card, idx) => (
          <div key={idx} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg bg-slate-800 ${card.c}`}>{card.i}</div>
              <span className="text-slate-400 font-medium">{card.t}</span>
            </div>
            <p className={`text-2xl font-bold ${card.c}`}>${card.v.toLocaleString('es-CO')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;