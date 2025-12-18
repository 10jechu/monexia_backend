import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, TrendingDown, CreditCard, 
  Edit2, Check, X, Wallet, Calendar, Filter, Zap
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
    <div className="max-w-6xl mx-auto space-y-8 p-4 text-left">
      
      {/* HEADER DINÁMICO & SALDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h2 className="text-4xl font-black text-white flex items-center gap-3 italic tracking-tighter uppercase leading-none">
            <TrendingDown className="text-rose-500 animate-pulse" size={40} /> Gastos Fijos 
          </h2>
          <p className="text-rose-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1 italic">Control de fugas de capital</p>
        </motion.div>
        
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setVerTodo(!verTodo)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-black text-[10px] uppercase transition-all shadow-lg ${verTodo ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/40' : 'bg-[#0f172a] text-slate-400 border-slate-700'}`}
          >
            <Filter size={14} /> {verTodo ? 'LOG COMPLETO' : 'MES ACTUAL'}
          </button>

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f172a] border-2 border-slate-700 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4"
          >
             <div className="bg-rose-500/10 p-2 rounded-lg"><Wallet size={20} className="text-rose-500"/></div>
             <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Saldo Post-Gasto</p>
                <p className="text-2xl font-black text-white italic tracking-tighter">${saldo.toLocaleString('es-CO')}</p>
             </div>
          </motion.div>
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO (ESTILO CYBER-FORM) */}
      <motion.form 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-6 items-end shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Descripción del Gasto</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-rose-500 outline-none transition-all placeholder:text-slate-800 text-sm"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="EJE: ARRIENDO NEO-BASE" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Monto ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-rose-500 outline-none transition-all text-sm"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Fecha de Vencimiento</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-rose-500 outline-none transition-all text-sm text-slate-500"
            value={form.fecha_pago} onChange={e => setForm({...form, fecha_pago: e.target.value})} />
        </div>
        
        <button type="submit" className="bg-rose-500 hover:bg-rose-400 text-[#0f172a] font-black py-4.5 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] uppercase text-xs tracking-tighter italic">
          <Plus size={18} strokeWidth={3} /> EJECUTAR GASTO
        </button>
      </motion.form>

      {/* LISTADO DE GASTOS (TABLA NEÓN) */}
      <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl -z-10"></div>
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-[10px] uppercase tracking-[0.3em] text-slate-500 border-b border-slate-800">
            <tr>
              <th className="p-6 font-black">Identificador</th>
              <th className="p-6 text-center font-black">Carga Económica</th>
              <th className="p-6 text-center font-black">Ciclo de Pago</th>
              <th className="p-6 text-right font-black px-12">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <AnimatePresence>
              {gastosFiltrados.map((g) => (
                <motion.tr 
                  layout key={g.id} 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                  className="hover:bg-rose-500/5 group transition-all"
                >
                  {editingId === g.id ? (
                    <>
                      <td className="p-4"><input className="bg-slate-900 border-2 border-rose-500 p-3 rounded-xl w-full text-sm text-white font-bold" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})}/></td>
                      <td className="p-4"><input type="number" className="bg-slate-900 border-2 border-rose-500 p-3 rounded-xl w-full text-sm text-center text-white font-bold" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                      <td className="p-4"><input type="date" className="bg-slate-900 border-2 border-rose-500 p-3 rounded-xl w-full text-sm text-center text-white font-bold" value={editForm.fecha_pago} onChange={e => setEditForm({...editForm, fecha_pago: e.target.value})}/></td>
                      <td className="p-4 text-right px-10">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => saveEdit(g.id)} className="bg-green-500 text-slate-900 p-2.5 rounded-xl hover:bg-green-400 transition-all"><Check size={18} strokeWidth={3}/></button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-700 text-white p-2.5 rounded-xl hover:bg-rose-500 transition-all"><X size={18}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-rose-500/10 p-3 rounded-2xl group-hover:bg-rose-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all duration-300">
                              <CreditCard size={18} className="text-rose-500 group-hover:text-[#0f172a] transition-colors"/>
                          </div>
                          <span className="uppercase text-xs font-black tracking-tighter text-white italic group-hover:text-rose-400 transition-colors">{g.nombre}</span>
                        </div>
                      </td>
                      <td className="p-6 font-black text-rose-500 text-center text-xl italic tracking-tighter">
                        -${Number(g.monto).toLocaleString('es-CO')}
                        <div className="text-[8px] uppercase tracking-widest text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Debitado del sistema</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#0f172a] px-4 py-2 rounded-xl border border-slate-800 group-hover:border-rose-500/50 transition-all shadow-inner">
                          <Calendar size={12} className="text-rose-500" />
                          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            {(() => {
                              const fechaVal = g.fecha_pago || g.fecha;
                              if (!fechaVal) return 'PENDIENTE';
                              const d = new Date(fechaVal);
                              d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                              return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long' }).toUpperCase();
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right px-12">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => startEdit(g)} className="bg-cyan-500/10 text-cyan-400 p-3 rounded-xl hover:bg-cyan-500 hover:text-[#0f172a] transition-all shadow-lg hover:shadow-cyan-500/30"><Edit2 size={16}/></button>
                          <button onClick={() => deleteGasto(g.id)} className="bg-rose-500/10 text-rose-500 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GastoFijoPage;