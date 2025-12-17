import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Target, Plus, Trash2, Calendar, TrendingUp, DollarSign, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetaAhorroPage = () => {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Formulario para CREAR
  const [form, setForm] = useState({
    nombre: '',
    monto_objetivo: '',
    fecha_limite: ''
  });

  // Formulario para EDITAR
  const [editForm, setEditForm] = useState({
    nombre: '',
    monto_objetivo: '',
    fecha_limite: ''
  });

  useEffect(() => { fetchMetas(); }, []);

  const fetchMetas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/metas/');
      setMetas(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Error cargando metas", err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/metas/', {
        ...form,
        monto_objetivo: parseFloat(form.monto_objetivo),
        monto_actual: 0
      });
      setForm({ nombre: '', monto_objetivo: '', fecha_limite: '' });
      fetchMetas();
    } catch (err) { alert("Error al crear la meta"); }
  };

  // --- Lógica de Edición ---
  const startEdit = (meta) => {
    setEditingId(meta.id);
    setEditForm({
      nombre: meta.nombre,
      monto_objetivo: meta.monto_objetivo,
      fecha_limite: meta.fecha_limite ? meta.fecha_limite.split('T')[0] : ''
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/metas/${id}`, {
        ...editForm,
        monto_objetivo: parseFloat(editForm.monto_objetivo)
      });
      setEditingId(null);
      fetchMetas();
    } catch (err) { alert("Error al actualizar la meta"); }
  };

  const handleAddAhorro = async (id) => {
    const monto = prompt("¿Cuánto deseas abonar a esta meta?");
    if (!monto || isNaN(monto)) return;

    try {
      await api.patch(`/metas/${id}/ahorrar?monto=${monto}`);
      fetchMetas();
    } catch (err) { alert("Error al registrar ahorro. Verifica si tienes saldo suficiente."); }
  };

  const deleteMeta = async (id) => {
    if (window.confirm("¿Eliminar esta meta?")) {
      try {
        await api.delete(`/metas/${id}`);
        fetchMetas();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  const calcularProgreso = (actual, objetivo) => {
    if (!objetivo || objetivo === 0) return 0;
    const porcentaje = (actual / objetivo) * 100;
    return Math.min(porcentaje, 100).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-white flex items-center gap-3"
      >
        <Target className="text-cyan-400" size={32} /> Metas de Ahorro
      </motion.h2>

      {/* Formulario de Registro (Estilo Monexia) */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-xl"
      >
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 block text-left tracking-widest">Nombre de la Meta</label>
          <input type="text" placeholder="Ej: Fondo de Emergencia" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400 transition-all"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 block text-left tracking-widest">Monto Objetivo</label>
          <input type="number" placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400 transition-all"
            value={form.monto_objetivo} onChange={e => setForm({...form, monto_objetivo: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 block text-left tracking-widest">Fecha Límite</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-cyan-400 transition-all"
            value={form.fecha_limite} onChange={e => setForm({...form, fecha_limite: e.target.value})} />
        </div>
        <button type="submit" className="bg-[#00e676] hover:bg-[#00c853] text-[#0f172a] font-black py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg active:scale-95 uppercase text-xs tracking-tighter">
          <Plus size={18} strokeWidth={3} /> Crear Meta
        </button>
      </motion.form>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {metas.map((meta) => {
            const progreso = calcularProgreso(meta.monto_actual, meta.monto_objetivo);
            const isEditing = editingId === meta.id;

            return (
              <motion.div 
                layout
                key={meta.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl hover:border-cyan-500/50 transition-all relative overflow-hidden group"
              >
                {isEditing ? (
                  /* VISTA EDICIÓN */
                  <div className="space-y-3">
                    <input className="w-full bg-slate-900 border border-cyan-500 p-2 rounded text-white text-sm" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
                    <input type="number" className="w-full bg-slate-900 border border-cyan-500 p-2 rounded text-white text-sm" value={editForm.monto_objetivo} onChange={e => setEditForm({...editForm, monto_objetivo: e.target.value})} />
                    <input type="date" className="w-full bg-slate-900 border border-cyan-500 p-2 rounded text-white text-sm" value={editForm.fecha_limite} onChange={e => setEditForm({...editForm, fecha_limite: e.target.value})} />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(meta.id)} className="flex-1 bg-green-500/20 text-green-400 p-2 rounded-xl flex justify-center"><Check size={20}/></button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-rose-500/20 text-rose-400 p-2 rounded-xl flex justify-center"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  /* VISTA NORMAL */
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">{meta.nombre}</h3>
                        <p className="text-slate-500 text-[10px] font-bold flex items-center gap-1 uppercase">
                          <Calendar size={12}/> Hasta: {meta.fecha_limite ? meta.fecha_limite.split('T')[0] : 'S/F'}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(meta)} className="text-slate-400 hover:text-cyan-400 p-1"><Edit2 size={16}/></button>
                        <button onClick={() => deleteMeta(meta.id)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 size={16}/></button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Progreso</span>
                        <span className="text-cyan-400">{progreso}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-[2px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progreso}%` }}
                          className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                      <div className="text-left">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Ahorrado</p>
                        <p className="text-xl font-black text-white">${Number(meta.monto_actual).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Objetivo</p>
                        <p className="text-lg font-black text-slate-500">${Number(meta.monto_objetivo).toLocaleString()}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAddAhorro(meta.id)}
                      className="w-full mt-4 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-[#0f172a] font-black py-3 rounded-2xl flex justify-center items-center gap-2 transition-all border border-cyan-500/20 active:scale-95"
                    >
                      <DollarSign size={18} strokeWidth={3}/> ABONAR AHORRO
                    </button>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {metas.length === 0 && !loading && (
        <div className="text-center py-20 bg-[#1e293b]/50 rounded-[3rem] border-2 border-dashed border-slate-700">
          <TrendingUp size={48} className="mx-auto text-slate-700 mb-4"/>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No hay metas activas</p>
        </div>
      )}
    </div>
  );
};

export default MetaAhorroPage;