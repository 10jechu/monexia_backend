import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Wallet, TrendingDown, Target, AlertCircle, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0, deudas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calcularResumen = async () => {
      setLoading(true);
      try {
        // Ajustamos las rutas exactas según tu main.py (ingresos, gasto-fijo, deudas)
        const [ing, gas, deu] = await Promise.all([
          api.get('/ingresos/'),
          api.get('/gasto-fijo/'),
          api.get('/deudas/')
        ]);

        const totalIng = ing.data.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        const totalGas = gas.data.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        // Sumamos el monto pendiente de las deudas para el resumen
        const totalDeu = deu.data.reduce((acc, curr) => acc + (curr.monto_pendiente || 0), 0);

        setResumen({ 
          ingresos: totalIng, 
          gastos: totalGas, 
          deudas: totalDeu,
          balance: totalIng - totalGas 
        });
      } catch (err) { 
        console.error("Error al cargar el dashboard:", err);
        // Si el error es 401 (No autorizado), axios.js debería manejarlo, 
        // pero aquí evitamos que la app "explote" si no hay datos.
      } finally {
        setLoading(false);
      }
    };
    calcularResumen();
  }, []);

  const tarjetas = [
    { t: 'Ingresos Totales', v: resumen.ingresos, c: 'text-green-400', i: <Wallet/> },
    { t: 'Gastos Fijos', v: resumen.gastos, c: 'text-rose-400', i: <TrendingDown/> },
    { t: 'Deudas Pendientes', v: resumen.deudas, c: 'text-amber-400', i: <AlertCircle/> },
    { t: 'Balance Familiar', v: resumen.balance, c: 'text-cyan-400', i: <Target/> },
  ];

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={48} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Resumen de Monexia</h1>
        <p className="text-slate-400 mt-2">Hola, así están tus finanzas hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetas.map((card, idx) => (
          <div key={idx} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl hover:border-slate-500 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-slate-800/50 ${card.c}`}>{card.i}</div>
              <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">{card.t}</span>
            </div>
            <p className={`text-2xl font-bold ${card.c}`}>
              ${card.v.toLocaleString('es-CO')}
            </p>
          </div>
        ))}
      </div>
      
      {/* Mensaje de alerta si el balance es negativo */}
      {resumen.balance < 0 && (
        <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-center gap-4 text-rose-500">
          <AlertCircle size={24} />
          <p className="font-medium">Atención: Tus gastos superan tus ingresos este mes.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;