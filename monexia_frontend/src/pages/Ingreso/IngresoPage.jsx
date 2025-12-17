import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Wallet, Calendar, Tag, Edit2, Check, X } from 'lucide-react';

const IngresoPage = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Formulario para Crear
  const [form, setForm] = useState({ 
    monto: '', 
    fuente: '', // Este es el nombre local del input
    fecha: new Date().toISOString().split('T')[0] 
  });

  // Formulario para Editar
  const [editForm, setEditForm] = useState({ monto: '', descripcion: '', fecha: '' });

  useEffect(() => { fetchIngresos(); }, []);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ingresos/');
      setIngresos(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ingresos/', { 
        monto: parseFloat(form.monto),
        descripcion: form.fuente, // Mapeamos fuente -> descripcion
        fecha: form.fecha 
      });
      setForm({ monto: '', fuente: '', fecha: new Date().toISOString().split('T')[0] });
      fetchIngresos();
      alert("¡Ingreso guardado!");
    } catch (err) { alert("Error al guardar"); }
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
      // Ahora el backend tiene PUT y el campo se llama 'descripcion'
      await api.put(`/ingresos/${id}`, {
        descripcion: editForm.descripcion,
        monto: parseFloat(editForm.monto),
        fecha: editForm.fecha
      });
      setEditingId(null);
      fetchIngresos();
    } catch (err) { 
      console.error(err);
      alert("Error al actualizar: Verifica que el campo sea 'descripcion'"); 
    }
  };

  const deleteIngreso = async (id) => {
    if (window.confirm("¿Eliminar registro?")) {
      try { await api.delete(`/ingresos/${id}`); fetchIngresos(); } catch (err) { alert("Error"); }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        <Wallet className="text-green-400" size={32} /> Gestión de Ingresos
      </h2>

      {/* Formulario de Entrada */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold px-1 text-left block">Descripción</label>
          <input type="text" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-green-400 transition-all"
            value={form.fuente} onChange={e => setForm({...form, fuente: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold px-1 text-left block">Monto ($)</label>
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-green-400 transition-all"
            value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold px-1 text-left block">Fecha</label>
          <input type="date" className="w-full bg-[#0f172a] border border-slate-600 p-2.5 rounded-lg text-white outline-none focus:border-green-400 transition-all"
            value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-400 text-[#0f172a] font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg active:scale-95">
          <Plus size={20} /> Registrar
        </button>
      </form>

      {/* Tabla */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#2d3a4f] text-slate-300 text-sm uppercase">
            <tr>
              <th className="p-4">Descripción</th>
              <th className="p-4 text-center">Monto</th>
              <th className="p-4 text-center">Fecha</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-300">
            {ingresos.map((ing) => (
              <tr key={ing.id} className="hover:bg-slate-700/30 transition-colors text-left">
                {editingId === ing.id ? (
                  <>
                    <td className="p-2"><input className="w-full bg-slate-900 border border-green-500 p-2 rounded text-sm text-white" value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})}/></td>
                    <td className="p-2"><input type="number" className="w-full bg-slate-900 border border-green-500 p-2 rounded text-sm text-center text-white" value={editForm.monto} onChange={e => setEditForm({...editForm, monto: e.target.value})}/></td>
                    <td className="p-2"><input type="date" className="w-full bg-slate-900 border border-green-500 p-2 rounded text-sm text-center text-white" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})}/></td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => saveEdit(ing.id)} className="text-green-400 p-2 hover:bg-green-500/10 rounded-lg"><Check size={18}/></button>
                        <button onClick={() => setEditingId(null)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg"><X size={18}/></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-medium flex items-center gap-2"><Tag size={14} className="text-green-500"/> {ing.descripcion}</td>
                    <td className="p-4 font-bold text-green-400 text-center">${Number(ing.monto).toLocaleString('es-CO')}</td>
                    <td className="p-4 text-sm text-slate-400 text-center">{ing.fecha?.split('T')[0]}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => startEdit(ing)} className="text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-lg transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => deleteIngreso(ing.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngresoPage;