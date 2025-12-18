import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { History, ArrowUpRight, ArrowDownLeft, Target, CreditCard, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MovimientosPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      // Asumiendo que tu backend tiene un endpoint /movimientos/
      const res = await api.get('/movimientos/');
      setMovimientos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando historial", err);
    } finally {
      setLoading(false);
    }
  };

  // Lógica para definir colores e iconos dinámicamente
  const getStyle = (tipo) => {
    switch(tipo.toLowerCase()) {
      case 'ingreso': return { color: 'text-green-400', bg: 'bg-green-500/10', icon: ArrowUpRight };
      case 'gasto': return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: ArrowDownLeft };
      case 'deuda': return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: CreditCard };
      case 'meta': return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Target };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: History };
    }
  };

  const filteredMovs = movimientos.filter(m => 
    m.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
    m.tipo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 italic">
            <History className="text-cyan-400" size={32} /> HISTORIAL DE MOVIMIENTOS
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] ml-12">Auditoría financiera completa</p>
        </div>
        
        {/* Buscador / Filtro */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
          <input 
            type="text" 
            placeholder="Buscar movimiento..."
            className="bg-[#1e293b] border border-slate-700 pl-10 pr-4 py-2 rounded-xl text-white text-xs outline-none focus:border-cyan-500 transition-all w-64"
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="p-5">Detalle</th>
              <th className="p-5 text-center">Tipo</th>
              <th className="p-5 text-center">Monto</th>
              <th className="p-5 text-center">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {filteredMovs.map((m, i) => {
                const style = getStyle(m.tipo);
                const Icon = style.icon;
                return (
                  <motion.tr 
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`${style.bg} ${style.color} p-2.5 rounded-2xl group-hover:scale-110 transition-transform`}>
                          <Icon size={18}/>
                        </div>
                        <div>
                          <p className="text-white font-black text-sm uppercase tracking-tight">{m.descripcion}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase italic">Ref: 00{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${style.color} ${style.bg} border-${style.color.split('-')[1]}-500/20`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className={`p-5 text-center font-black text-lg tracking-tighter ${m.tipo === 'ingreso' ? 'text-green-400' : 'text-rose-500'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}${Number(m.monto).toLocaleString('es-CO')}
                    </td>
                    <td className="p-5 text-center">
                      <p className="text-[11px] font-bold text-slate-400">{m.fecha?.split('T')[0]}</p>
                      <p className="text-[9px] text-slate-600 font-bold">{m.fecha?.split('T')[1]?.substring(0, 5) || ''}</p>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        
        {filteredMovs.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <Filter size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No se encontraron registros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovimientosPage;