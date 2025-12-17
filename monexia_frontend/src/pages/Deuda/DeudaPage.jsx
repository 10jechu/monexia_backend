import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { AlertCircle, Plus, Trash2, Edit2, Check, X, CreditCard, ArrowDownCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeudaPage = () => {
  const [deudas, setDeudas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Formulario Crear
  const [form, setForm] = useState({
    acreedor: '',
    monto: '',
    tasa_interes: '0',
    fecha_vencimiento: new Date().toISOString().split('T')[0]
  });

  // Formulario Editar
  const [editForm, setEditForm] = useState({ acreedor: '', monto: '', fecha_vencimiento: '' });

  const fetchDeudas = async () => {
    try {
      const res = await api.get('/deudas/');
      setDeudas(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Error cargando deudas", err); }
  };

  useEffect(() => { fetchDeudas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deudas/', {
        ...form,
        monto: parseFloat(form.monto),
        monto_pagado: 0
      });
      setForm({ acreedor: '', monto: '', tasa_interes: '0', fecha_vencimiento: new Date().toISOString().split('T')[0] });
      fetchDeudas();
    } catch (err) { alert("Error al registrar deuda."); }
  };

  // --- Lógica de Abonos ---
  const handleAbonar = async (id) => {
    const monto = prompt("¿Cuánto deseas abonar a esta deuda?");
    if (!monto || isNaN(monto)) return;

    try {
      // Ruta: /deudas/{id}/pagar?monto=100
      await api.patch(`/deudas/${id}/pagar?monto=${monto}`);
      fetchDeudas();
    } catch (err) { 
        alert("Error al procesar el pago. Verifica que el monto no exceda la deuda."); 
    }
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditForm({ acreedor: d.acreedor, monto: d.monto, fecha_vencimiento: d.fecha_vencimiento?.split('T')[0] });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/deudas/${id}`, { ...editForm, monto: parseFloat(editForm.monto) });
      setEditingId(null);
      fetchDeudas();
    } catch (err) { alert("Error al actualizar"); }
  };

  const deleteDeuda = async (id) => {
    if (window.confirm("¿Eliminar este registro de deuda?")) {
      try {
        await api.delete(`/deudas/${id}`);
        fetchDeudas();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <AlertCircle className="text-amber-500" size={32} /> Control de Deudas
          </h2>
          <p className="text-slate-400 text-sm italic">Mantén tus compromisos bajo control</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl text-right">
          <p className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Deuda Total Pendiente</p>
          <p className="text-2xl font-black text-amber-500">
            ${deudas.reduce((a, b) => a + (Number(b.monto) - Number(b.monto_pagado || 0)), 0).toLocaleString('es-CO')}
          </p>
        </div>
      </motion.div>

      {/* Formulario Registro */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-xl">
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest">Acreedor (A quién le debes)</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-amber-500"
            value={form.acreedor} onChange={e => setForm({...form, acreedor: e.target.value})} required />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest">Monto de la Deuda</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-amber-500"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-slate-400 uppercase font-black px-1 tracking-widest">Fecha Límite</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-amber-500"
            value={form.fecha_vencimiento} onChange={e => setForm({...form, fecha_vencimiento: e.target.value})} />
        </div>
        <button type="submit" className="bg-[#00e676] hover:bg-[#00c853] text-[#0f172a] font-black py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg uppercase text-xs">
          <Plus size={18} strokeWidth={3} /> Registrar Deuda
        </button>
      </form>

      {/* Tabla de Deudas */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-[#0f172a] text-[10px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="p-4">Acreedor</th>
              <th className="p-4 text-center">Deuda Original</th>
              <th className="p-4 text-center">Saldo Pendiente</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {deudas.map((d) => {
              const pendiente = d.monto - (d.monto_pagado || 0);
              return (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors group">
                  {editingId === d.id ? (
                    <>
                      <td className="p-2"><input className="bg-slate-900 border border-amber-500 p-2 rounded w-full text-sm text-white font-bold" value={editForm.acreedor} onChange={e => setEditForm({...editForm, acreedor: e.target.value})}/></td>
                      <td className="p-2"><input type="number" className="bg-slate-900 border border-amber-500 p-2 rounded w-full text-sm text-center text-white" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                      <td className="p-2 text-center text-slate-500">---</td>
                      <td className="p-2 text-center flex justify-center gap-2">
                        <button onClick={() => saveEdit(d.id)} className="text-green-400 p-2"><Check size={20}/></button>
                        <button onClick={() => setEditingId(null)} className="text-rose-400 p-2"><X size={20}/></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 flex items-center gap-3 uppercase text-[12px] font-bold tracking-tight">
                        <div className="bg-amber-500/10 p-2 rounded-lg"><CreditCard size={14} className="text-amber-400"/></div>
                        {d.acreedor}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-400">${Number(d.monto).toLocaleString()}</td>
                      <td className="p-4 text-center font-black text-amber-500 text-lg">
                        ${pendiente.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleAbonar(d.id)} className="bg-amber-500 text-[#0f172a] px-3 py-1 rounded-lg text-[10px] font-black hover:bg-amber-400 transition-colors flex items-center gap-1 uppercase">
                            <ArrowDownCircle size={14}/> Abonar
                          </button>
                          <button onClick={() => startEdit(d)} className="text-slate-400 hover:text-cyan-400 transition-colors"><Edit2 size={16}/></button>
                          <button onClick={() => deleteDeuda(d.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeudaPage;