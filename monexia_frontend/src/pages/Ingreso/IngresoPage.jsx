import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Wallet, Calendar, Edit2, Check, X, ArrowUpCircle, Zap, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IngresoPage = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ 
    monto: '', 
    fuente: '', 
    fecha: new Date().toISOString().split('T')[0] 
  });

  const [editForm, setEditForm] = useState({ monto: '', descripcion: '', fecha: '' });

  useEffect(() => { fetchIngresos(); }, []);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ingresos/');
      setIngresos(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Error de conexión:", err); 
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ingresos/', { 
        monto: parseFloat(form.monto),
        descripcion: form.fuente,
        fecha: form.fecha 
      });
      setForm({ monto: '', fuente: '', fecha: new Date().toISOString().split('T')[0] });
      fetchIngresos();
    } catch (err) { alert("Error al guardar."); }
  };

  const startEdit = (ing) => {
    setEditingId(ing.id);
    setEditForm({ 
      monto: ing.monto, 
      descripcion: ing.descripcion, 
      fecha: ing.fecha ? ing.fecha.split('T')[0] : '' 
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/ingresos/${id}`, {
        descripcion: editForm.descripcion,
        monto: parseFloat(editForm.monto),
        fecha: editForm.fecha
      });
      setEditingId(null);
      fetchIngresos();
    } catch (err) { alert("Error al actualizar"); }
  };

  const deleteIngreso = async (id) => {
    if (window.confirm("¿Eliminar registro de ingreso?")) {
      try { await api.delete(`/ingresos/${id}`); fetchIngresos(); } catch (err) { alert("Error"); }
    }
  };

  const totalIngresos = ingresos.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 text-left">
      
      {/* HEADER & RECAUDO WIDGET */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-black text-white flex items-center gap-3 italic tracking-tighter uppercase leading-none">
            <Wallet className="text-[#00e676] animate-pulse" size={40} /> Inyección_Capital
          </h2>
          <p className="text-[#00e676]/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1 italic">Flujo de caja entrante optimizado</p>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0f172a] border-2 border-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.2)] px-8 py-4 rounded-[2rem] flex items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#00e676]/5 blur-2xl"></div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Recaudado</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">
              ${totalIngresos.toLocaleString('es-CO')}
            </p>
          </div>
          <div className="bg-[#00e676]/20 p-3 rounded-2xl border border-[#00e676]/30">
            <Zap className="text-[#00e676] fill-[#00e676]" size={20} />
          </div>
        </motion.div>
      </div>

      {/* FORMULARIO CYBER-GREEN */}
      <motion.form 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-6 items-end shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e676] to-transparent" />
        
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Fuente de Ingreso</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-[#00e676] outline-none transition-all placeholder:text-slate-800 text-sm"
            placeholder="EJ: SALARIO QUINCENAL" value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Monto de Inyección ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-[#00e676] outline-none transition-all text-sm"
            placeholder="0.00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Fecha Contable</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-[#00e676] outline-none transition-all text-sm text-slate-500"
            value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
        </div>
        
        <button type="submit" className="bg-[#00e676] hover:bg-[#00ff81] text-[#0f172a] font-black py-4.5 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_30px_rgba(0,230,118,0.5)] uppercase text-xs tracking-tighter italic">
          <Plus size={18} strokeWidth={3} /> REGISTRAR ENTRADA
        </button>
      </motion.form>

      {/* TABLA DE INGRESOS NEÓN */}
      <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl relative">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00e676]/5 blur-3xl -z-10"></div>
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] border-b border-slate-800">
            <tr>
              <th className="p-6">Origen de Capital</th>
              <th className="p-6 text-center">Magnitud</th>
              <th className="p-6 text-center">Timestamp</th>
              <th className="p-6 text-right px-12">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <AnimatePresence>
              {ingresos.map((ing) => (
                <motion.tr 
                  layout key={ing.id} 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                  className="hover:bg-[#00e676]/5 group transition-all"
                >
                  {editingId === ing.id ? (
                    <>
                      <td className="p-4"><input className="bg-slate-900 border-2 border-[#00e676] p-3 rounded-xl w-full text-sm text-white font-bold" value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})}/></td>
                      <td className="p-4"><input type="number" className="bg-slate-900 border-2 border-[#00e676] p-3 rounded-xl w-full text-sm text-center text-white font-bold" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                      <td className="p-4"><input type="date" className="bg-slate-900 border-2 border-[#00e676] p-3 rounded-xl w-full text-sm text-center text-white font-bold" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})}/></td>
                      <td className="p-4 text-right px-10">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => saveEdit(ing.id)} className="bg-[#00e676] text-[#0f172a] p-2.5 rounded-xl hover:bg-[#00ff81] transition-all"><Check size={18} strokeWidth={3}/></button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-700 text-white p-2.5 rounded-xl hover:bg-rose-500 transition-all"><X size={18}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#00e676]/10 p-3 rounded-2xl group-hover:bg-[#00e676] group-hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-300">
                            <ArrowUpCircle size={18} className="text-[#00e676] group-hover:text-[#0f172a] transition-colors"/>
                          </div>
                          <div>
                            <p className="text-white font-black text-sm uppercase italic tracking-tighter group-hover:text-[#00e676] transition-colors">{ing.descripcion}</p>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Hash_ID: #{ing.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center font-black text-[#00e676] text-xl italic tracking-tighter">
                        +${Number(ing.monto).toLocaleString('es-CO')}
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#0f172a] px-4 py-2 rounded-xl border border-slate-800 group-hover:border-[#00e676]/50 transition-all shadow-inner">
                          <Calendar size={12} className="text-[#00e676]" />
                          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest group-hover:text-white transition-colors">
                            {ing.fecha ? ing.fecha.split('T')[0] : 'SIN FECHA'}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right px-12">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => startEdit(ing)} className="bg-cyan-500/10 text-cyan-400 p-3 rounded-xl hover:bg-cyan-500 hover:text-[#0f172a] transition-all shadow-lg hover:shadow-cyan-500/30"><Edit2 size={16}/></button>
                          <button onClick={() => deleteIngreso(ing.id)} className="bg-rose-500/10 text-rose-500 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {ingresos.length === 0 && !loading && (
          <div className="py-24 text-center">
            <div className="inline-block p-6 bg-slate-900 rounded-[2rem] border border-slate-800 mb-4 shadow-inner">
               <DollarSign size={48} className="text-slate-700 animate-pulse" />
            </div>
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.4em] italic">Sistema a la espera de capital entrante</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngresoPage;