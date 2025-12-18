import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Target, Plus, Trash2, Calendar, DollarSign, Edit2, Check, X, Wallet, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetaAhorroPage = () => {
  const [metas, setMetas] = useState([]);
  const [saldoDisponible, setSaldoDisponible] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ nombre: '', monto_objetivo: '', fecha_limite: '' });
  const [editForm, setEditForm] = useState({ nombre: '', monto_objetivo: '', fecha_limite: '' });

  useEffect(() => { 
    fetchMetas();
    fetchSaldo(); 
  }, []);

  const fetchSaldo = async () => {
    try {
      // Usamos el endpoint del dashboard para traer el sueldo disponible real
      const res = await api.get('/dashboard/resumen'); 
      setSaldoDisponible(res.data.sueldo_disponible || 0);
    } catch (err) { console.error("Error al obtener saldo", err); }
  };

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

  const handleAddAhorro = async (id) => {
    const monto = prompt("¿Cuánto deseas abonar a esta meta?");
    if (!monto || isNaN(monto)) return;

    try {
      await api.patch(`/metas/${id}/ahorrar?monto=${monto}`);
      fetchMetas();
      fetchSaldo(); // Actualiza el sueldo disponible tras el ahorro
    } catch (err) { 
      alert("Saldo insuficiente en tu cuenta principal."); 
    }
  };

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

  const deleteMeta = async (id) => {
    if (window.confirm("¿Eliminar esta meta?")) {
      try {
        await api.delete(`/metas/${id}`);
        fetchMetas();
        fetchSaldo();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  const calcularProgreso = (actual, objetivo) => {
    if (!objetivo || objetivo === 0) return 0;
    return Math.min((actual / objetivo) * 100, 100).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      
      {/* HEADER & WIDGET SUELDO (Sincronizado con Dashboard) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-white flex items-center gap-3 italic tracking-tighter"
        >
          <Target className="text-cyan-400 animate-pulse" size={40} /> METAS_DE_AHORRO
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a] border-2 border-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.2)] px-6 py-3 rounded-2xl flex items-center gap-4"
        >
          <div className="bg-[#00e676]/10 p-2 rounded-lg border border-[#00e676]/20">
            <Wallet className="text-[#00e676]" size={24} />
          </div>
          <div>
            <p className="text-[10px] text-[#00e676] font-black uppercase tracking-[0.2em]">Sueldo Disponible</p>
            <p className="text-2xl font-black text-white tracking-tighter">
              ${Number(saldoDisponible).toLocaleString()}
            </p>
          </div>
          <Zap className="text-yellow-400 fill-yellow-400 ml-2" size={16} />
        </motion.div>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b]/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 block tracking-widest text-left">Protocolo de Meta</label>
          <input type="text" placeholder="Ej: Fondo de Emergencia" className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-cyan-400 transition-all text-sm"
            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 block tracking-widest text-left">Monto Objetivo</label>
          <input type="number" placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-cyan-400 transition-all text-sm"
            value={form.monto_objetivo} onChange={e => setForm({...form, monto_objetivo: e.target.value})} required />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 block tracking-widest text-left">Fecha de Cierre</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-3 rounded-xl text-white outline-none focus:border-cyan-400 transition-all text-sm text-slate-400"
            value={form.fecha_limite} onChange={e => setForm({...form, fecha_limite: e.target.value})} />
        </div>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-black py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 uppercase text-xs">
          <Plus size={18} strokeWidth={3} /> Iniciar Protocolo
        </button>
      </motion.form>

      {/* GRID DE METAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {metas.map((meta) => {
            const progreso = calcularProgreso(meta.monto_actual, meta.monto_objetivo);
            const isEditing = editingId === meta.id;

            return (
              <motion.div 
                layout
                key={meta.id}
                className="bg-[#1e293b] border border-slate-700 rounded-[2rem] p-6 space-y-4 shadow-xl hover:border-cyan-500/50 transition-all relative group overflow-hidden"
              >
                {isEditing ? (
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
                  <>
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-cyan-400 transition-colors text-left">{meta.nombre}</h3>
                        <p className="text-slate-500 text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest mt-1 text-left">
                          <Calendar size={12} className="text-cyan-500"/> Límite: {meta.fecha_limite ? meta.fecha_limite.split('T')[0] : 'S/F'}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(meta)} className="text-slate-400 hover:text-cyan-400 p-1"><Edit2 size={16}/></button>
                        <button onClick={() => deleteMeta(meta.id)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 size={16}/></button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Integridad de Ahorro</span>
                        <span className="text-cyan-400">{progreso}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-[3px] border border-slate-700">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progreso}%` }}
                          className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full relative"
                        >
                          <div className="absolute top-0 right-0 w-2 h-full bg-white blur-[2px] opacity-30"></div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                      <div className="text-left">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter text-left">Status Actual</p>
                        <p className="text-2xl font-black text-white text-left">${Number(meta.monto_actual).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter text-right">Target Final</p>
                        <p className="text-lg font-black text-slate-600 text-right">${Number(meta.monto_objetivo).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* BOTÓN AZUL CIAN RE-DISEÑADO */}
                    <button 
                      onClick={() => handleAddAhorro(meta.id)}
                      className="w-full mt-4 bg-cyan-500 text-[#0f172a] font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:bg-cyan-400 active:scale-95 text-xs uppercase italic"
                    >
                      <DollarSign size={18} strokeWidth={3}/> INYECTAR CAPITAL
                    </button>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MetaAhorroPage;