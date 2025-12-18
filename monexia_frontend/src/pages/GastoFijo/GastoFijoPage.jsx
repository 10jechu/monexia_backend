import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, TrendingDown, CreditCard, 
  Edit2, Check, X, Wallet, Calendar, Filter, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GastoFijoPage = () => {
  const [gastos, setGastos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [verTodo, setVerTodo] = useState(false);
  
  const [form, setForm] = useState({ 
    nombre: '', 
    monto: '', 
    fecha_pago: new Date().toISOString().split('T')[0] 
  });
  
  const [editForm, setEditForm] = useState({ 
    nombre: '', 
    monto: '', 
    fecha_pago: '' 
  });

  const fetchData = async () => {
    try {
      const [resG, resI] = await Promise.all([
        api.get('/gastos/'),
        api.get('/ingresos/')
      ]);
      setGastos(resG.data);
      
      const totalI = resI.data.reduce((a, b) => a + Number(b.monto), 0);
      const totalG = resG.data.reduce((a, b) => a + Number(b.monto), 0);
      setSaldo(totalI - totalG);
    } catch (err) { 
      console.error("Error cargando datos:", err); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // LÓGICA DE FILTRADO POR MES ACTUAL
  const gastosFiltrados = verTodo ? gastos : gastos.filter(g => {
    const fechaRef = g.fecha_pago || g.fecha;
    if (!fechaRef) return true;
    const fechaGasto = new Date(fechaRef);
    const ahora = new Date();
    return fechaGasto.getMonth() === ahora.getMonth() && 
           fechaGasto.getFullYear() === ahora.getFullYear();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gastos/', { ...form, monto: parseFloat(form.monto) });
      setForm({ nombre: '', monto: '', fecha_pago: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { alert("Error al guardar."); }
  };

  const startEdit = (g) => {
    setEditingId(g.id);
    setEditForm({ 
      nombre: g.nombre, 
      monto: g.monto, 
      fecha_pago: (g.fecha_pago || g.fecha || '').split('T')[0] 
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/gastos/${id}`, { ...editForm, monto: parseFloat(editForm.monto) });
      setEditingId(null);
      fetchData();
    } catch (err) { alert("Error al actualizar"); }
  };

  const deleteGasto = async (id) => {
    if (window.confirm("¿Deseas eliminar este gasto fijo?")) {
      try {
        await api.delete(`/gastos/${id}`);
        fetchData();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 text-left">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <motion.h2 initial={{ x: -20 }} animate={{ x: 0 }} className="text-4xl font-black text-white flex items-center gap-3 italic tracking-tighter">
            <TrendingDown className="text-rose-500" size={40} /> GASTOS FIJOS
          </motion.h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 ml-1">Control de egresos mensuales</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setVerTodo(!verTodo)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-black text-[10px] uppercase transition-all shadow-lg ${verTodo ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
          >
            <Filter size={14} /> {verTodo ? 'Historial Completo' : 'Mes Actual'}
          </button>

          <div className="bg-[#1e293b] border border-slate-700 px-6 py-3 rounded-[2rem] shadow-xl">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center justify-end gap-2 mb-1">
              <Wallet size={12} className="text-green-400"/> Saldo Restante
            </p>
            <p className="text-2xl font-black text-white italic tracking-tighter">${saldo.toLocaleString('es-CO')}</p>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      <motion.form 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-6 items-end shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-500 uppercase font-black ml-1 tracking-widest">Descripción</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-3.5 rounded-xl text-white font-bold focus:border-rose-500 outline-none transition-all placeholder:text-slate-700"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Eje: Arriendo" />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-500 uppercase font-black ml-1 tracking-widest">Monto ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-3.5 rounded-xl text-white font-bold focus:border-rose-500 outline-none transition-all"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required placeholder="0" />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-500 uppercase font-black ml-1 tracking-widest">Vencimiento</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-700 p-3.5 rounded-xl text-white font-bold focus:border-rose-500 outline-none transition-all"
            value={form.fecha_pago} onChange={e => setForm({...form, fecha_pago: e.target.value})} />
        </div>
        <button type="submit" className="bg-rose-500 hover:bg-rose-400 text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 shadow-[0_10px_20px_rgba(244,63,94,0.3)] uppercase text-[11px] tracking-wider">
          <Plus size={18} strokeWidth={3} /> Registrar Gasto
        </button>
      </motion.form>

      {/* TABLA DE GASTOS */}
      <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a] text-[10px] uppercase tracking-[0.25em] text-slate-500 border-b border-slate-800">
            <tr>
              <th className="p-6 font-black">Servicio</th>
              <th className="p-6 text-center font-black">Monto</th>
              <th className="p-6 text-center font-black">Fecha de Pago</th>
              <th className="p-6 text-right font-black px-12">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            <AnimatePresence>
              {gastosFiltrados.length > 0 ? (
                gastosFiltrados.map((g) => (
                  <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-800/40 group transition-all">
                    {editingId === g.id ? (
                      <>
                        <td className="p-4"><input className="bg-slate-900 border border-rose-500 p-3 rounded-xl w-full text-sm text-white font-bold" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})}/></td>
                        <td className="p-4"><input type="number" className="bg-slate-900 border border-rose-500 p-3 rounded-xl w-full text-sm text-center text-white font-bold" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                        <td className="p-4"><input type="date" className="bg-slate-900 border border-rose-500 p-3 rounded-xl w-full text-sm text-center text-white font-bold" value={editForm.fecha_pago} onChange={e => setEditForm({...editForm, fecha_pago: e.target.value})}/></td>
                        <td className="p-4 text-right px-10">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => saveEdit(g.id)} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-400 transition-all"><Check size={18}/></button>
                            <button onClick={() => setEditingId(null)} className="bg-slate-700 text-white p-2 rounded-lg hover:bg-rose-500 transition-all"><X size={18}/></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="bg-rose-500/10 p-3 rounded-2xl group-hover:bg-rose-500 transition-all duration-300">
                                <CreditCard size={18} className="text-rose-400 group-hover:text-white transition-colors"/>
                            </div>
                            <span className="uppercase text-xs font-black tracking-widest text-white group-hover:translate-x-1 transition-transform italic">{g.nombre}</span>
                          </div>
                        </td>
                        <td className="p-6 font-black text-rose-500 text-center text-lg italic tracking-tighter">
                          -${Number(g.monto).toLocaleString('es-CO')}
                        </td>
                        <td className="p-6 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-800 group-hover:border-rose-500/30 transition-all">
                            <Calendar size={12} className="text-rose-500" />
                            <span className="text-slate-400 font-black text-[11px] uppercase tracking-tighter group-hover:text-white transition-colors">
                              {(() => {
                                const fechaVal = g.fecha_pago || g.fecha;
                                if (!fechaVal) return 'Pendiente';
                                const d = new Date(fechaVal);
                                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                                return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-right px-12">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => startEdit(g)} className="bg-cyan-500/10 text-cyan-400 p-2.5 rounded-xl hover:bg-cyan-500 hover:text-white transition-all shadow-lg hover:shadow-cyan-500/20"><Edit2 size={16}/></button>
                            <button onClick={() => deleteGasto(g.id)} className="bg-slate-700/30 text-slate-500 p-2.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Calendar size={48} className="text-slate-500" />
                      <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Sin gastos en este periodo</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GastoFijoPage;