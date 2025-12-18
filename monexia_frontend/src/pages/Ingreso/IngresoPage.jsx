import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Wallet, Calendar, Tag, Edit2, Check, X, ArrowUpCircle } from 'lucide-react';
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
      console.error("Error de conexión. ¿Está el backend encendido?", err); 
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
    } catch (err) { alert("Error al guardar. Revisa la consola."); }
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
    if (window.confirm("¿Eliminar registro?")) {
      try { await api.delete(`/ingresos/${id}`); fetchIngresos(); } catch (err) { alert("Error"); }
    }
  };

  const totalIngresos = ingresos.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Cabecera con Total */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 italic tracking-tighter">
            <Wallet className="text-[#00e676]" size={36} /> GESTIÓN DE INGRESOS
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-12">Flujo de caja entrante</p>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#00e676]/10 border border-[#00e676]/20 px-8 py-4 rounded-[2rem] text-right shadow-[0_0_20px_rgba(0,230,118,0.1)]"
        >
          <p className="text-[10px] text-[#00e676] font-black uppercase tracking-widest mb-1">Total Recaudado</p>
          <p className="text-3xl font-black text-white tracking-tighter">${totalIngresos.toLocaleString('es-CO')}</p>
        </motion.div>
      </div>

      {/* Formulario */}
      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00e676]" />
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest">Descripción / Fuente</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-[#00e676] transition-all font-bold text-sm"
            placeholder="Ej: Salario Quincenal" value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})} required />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest">Monto ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-[#00e676] transition-all font-bold text-sm"
            placeholder="0.00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest">Fecha de Ingreso</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-[#00e676] transition-all font-bold text-sm"
            value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
        </div>
        <button type="submit" className="bg-[#00e676] hover:bg-[#00c853] text-[#0f172a] font-black py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_4px_15px_rgba(0,230,118,0.3)] active:scale-95 uppercase text-xs tracking-tighter">
          <Plus size={20} strokeWidth={3} /> Registrar Ingreso
        </button>
      </motion.form>

      {/* Tabla Pro */}
      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="p-5">Origen del Dinero</th>
              <th className="p-5 text-center">Monto</th>
              <th className="p-5 text-center">Fecha</th>
              <th className="p-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {ingresos.map((ing) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={ing.id} 
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {editingId === ing.id ? (
                    <>
                      <td className="p-3"><input className="w-full bg-slate-900 border border-[#00e676] p-2 rounded-lg text-sm text-white" value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})}/></td>
                      <td className="p-3"><input type="number" className="w-full bg-slate-900 border border-[#00e676] p-2 rounded-lg text-sm text-center text-white" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                      <td className="p-3"><input type="date" className="w-full bg-slate-900 border border-[#00e676] p-2 rounded-lg text-sm text-center text-white" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})}/></td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => saveEdit(ing.id)} className="bg-green-500/20 text-green-400 p-2 rounded-xl"><Check size={20}/></button>
                          <button onClick={() => setEditingId(null)} className="bg-rose-500/20 text-rose-400 p-2 rounded-xl"><X size={20}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#00e676]/10 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform">
                            <ArrowUpCircle size={18} className="text-[#00e676]"/>
                          </div>
                          <div>
                            <p className="text-white font-black text-sm uppercase tracking-tight">{ing.descripcion}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">ID: #{ing.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center font-black text-[#00e676] text-lg tracking-tighter">
                        +${Number(ing.monto).toLocaleString('es-CO')}
                      </td>
                      <td className="p-5 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                          <Calendar size={12} className="text-slate-500"/>
                          <span className="text-[11px] font-bold text-slate-400">{ing.fecha?.split('T')[0]}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => startEdit(ing)} className="text-cyan-400 hover:bg-cyan-400/10 p-2 rounded-xl transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => deleteIngreso(ing.id)} className="text-slate-500 hover:text-rose-500 p-2 rounded-xl transition-colors"><Trash2 size={18} /></button>
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
          <div className="py-20 text-center">
            <Wallet size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">No se registran ingresos este mes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngresoPage;