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
      // Ajuste para asegurar que siempre manejamos un array
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
      descripcion: ing.descripcion || '', 
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
    if (window.confirm("¿Confirmas la eliminación de este registro?")) {
      try { 
        await api.delete(`/ingresos/${id}`); 
        fetchIngresos(); 
      } catch (err) { 
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el registro"); 
      }
    }
  };

  const totalIngresos = ingresos.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 text-left">
      
      {/* HEADER INTEGRADO AL ESTILO DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-black text-white flex items-center gap-3 italic tracking-tighter uppercase leading-none">
            <Wallet className="text-[#00e676]" size={40} /> INYECCIÓN_CAPITAL
          </h2>
          <p className="text-[#00e676]/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1 italic">Gestión de flujo entrante</p>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0f172a] border-2 border-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.2)] px-8 py-4 rounded-[2rem] flex items-center gap-6"
        >
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Disponible Total</p>
            <p className="text-3xl font-black text-[#00e676] italic tracking-tighter">
              ${totalIngresos.toLocaleString('es-CO')}
            </p>
          </div>
          <Zap className="text-[#00e676] animate-pulse" size={24} />
        </motion.div>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      <motion.form 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-6 items-end shadow-2xl"
      >
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Fuente</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-[#00e676] outline-none transition-all text-sm"
            placeholder="EJ: SALARIO" value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Monto</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-[#00e676] outline-none transition-all text-sm"
            placeholder="0.00" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Fecha</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold focus:border-[#00e676] outline-none transition-all text-sm"
            value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
        </div>
        <button type="submit" className="bg-[#00e676] hover:bg-[#00ff81] text-[#0f172a] font-black py-4.5 rounded-xl transition-all shadow-lg active:scale-95 uppercase text-xs">
          Registrar Ingreso
        </button>
      </motion.form>

      {/* TABLA DE CONTROL */}
      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800">
            <tr>
              <th className="p-6">Origen</th>
              <th className="p-6 text-center">Monto</th>
              <th className="p-6 text-center">Fecha</th>
              <th className="p-6 text-right px-12">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <AnimatePresence mode='popLayout'>
              {ingresos.map((ing) => (
                <motion.tr 
                  key={ing.id} 
                  layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                  className="hover:bg-slate-800/40 group transition-colors"
                >
                  {editingId === ing.id ? (
                    <>
                      <td className="p-4"><input className="bg-slate-900 border border-[#00e676] p-2 rounded-lg w-full text-white text-sm" value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})}/></td>
                      <td className="p-4"><input type="number" className="bg-slate-900 border border-[#00e676] p-2 rounded-lg w-full text-center text-white text-sm" value={editForm.editMonto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                      <td className="p-4"><input type="date" className="bg-slate-900 border border-[#00e676] p-2 rounded-lg w-full text-center text-white text-sm" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})}/></td>
                      <td className="p-4 text-right px-10">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => saveEdit(ing.id)} className="bg-[#00e676] text-black p-2 rounded-lg"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-700 text-white p-2 rounded-lg"><X size={16}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <ArrowUpCircle size={18} className="text-[#00e676]"/>
                          <span className="text-white font-bold uppercase text-sm tracking-tight">{ing.descripcion}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center font-black text-[#00e676] text-lg">
                        +${Number(ing.monto).toLocaleString('es-CO')}
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-slate-400 font-bold text-xs bg-[#0f172a] px-3 py-1 rounded-full border border-slate-800">
                          {ing.fecha?.split('T')[0]}
                        </span>
                      </td>
                      <td className="p-6 text-right px-12">
                        <div className="flex justify-end gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(ing)} className="text-cyan-400 hover:text-cyan-200">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteIngreso(ing.id)} className="text-rose-500 hover:text-rose-300">
                            <Trash2 size={18} />
                          </button>
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

export default IngresoPage;