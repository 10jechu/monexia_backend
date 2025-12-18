import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, CreditCard, Wallet, 
  ArrowUpCircle, TrendingDown, Check, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeudaPage = () => {
  const [deudas, setDeudas] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [abonoId, setAbonoId] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');

  const [form, setForm] = useState({ 
    nombre: '', monto_total: '', tasa_interes: '', 
    fecha_limite: new Date().toISOString().split('T')[0] 
  });

  const fetchData = async () => {
    try {
      const [resD, resI, resG] = await Promise.all([
        api.get('/deudas/'), api.get('/ingresos/'), api.get('/gastos/')
      ]);
      const lista = resD.data || [];
      setDeudas(lista);
      
      const totalI = resI.data.reduce((a, b) => a + Number(b.monto), 0);
      const totalG = resG.data.reduce((a, b) => a + Number(b.monto), 0);
      const totalD = lista.reduce((a, b) => a + Number(b.monto_pendiente), 0);
      setSaldo(totalI - totalG - totalD);
    } catch (err) { console.error("Error al cargar datos", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        nombre: form.nombre,
        monto_total: parseFloat(form.monto_total),
        monto_pendiente: parseFloat(form.monto_total),
        tasa_interes: parseFloat(form.tasa_interes),
        tipo_tasa: "mensual",
        fecha_inicio: new Date().toISOString(),
        fecha_limite: new Date(form.fecha_limite).toISOString()
      };
      await api.post('/deudas/', payload);
      setForm({ nombre: '', monto_total: '', tasa_interes: '', fecha_limite: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { alert("Error al guardar la deuda"); }
  };

  const registrarAbono = async (deuda) => {
    const valor = parseFloat(montoAbono);
    if (!valor || valor <= 0) return;

    // Lógica de Amortización Simple
    const interesMes = deuda.monto_pendiente * (deuda.tasa_interes / 100);
    const abonoCapital = valor - interesMes;
    
    if (abonoCapital <= 0) {
        alert("El abono es muy bajo, ¡no alcanza ni a cubrir los intereses!");
        return;
    }

    const nuevoPendiente = Math.max(0, deuda.monto_pendiente - abonoCapital);

    try {
      await api.patch(`/deudas/${deuda.id}`, { monto_pendiente: nuevoPendiente });
      setAbonoId(null);
      setMontoAbono('');
      fetchData();
      alert(`Abono exitoso. Pagaste $${interesMes.toLocaleString()} de interés y $${abonoCapital.toLocaleString()} de capital.`);
    } catch (err) { alert("Error al procesar el abono"); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg">
            <TrendingDown className="text-slate-900" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Deudas</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gestión de Pasivos</p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 px-8 py-4 rounded-[2rem] min-w-[240px]">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Saldo Disponible tras deudas</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">
            ${saldo.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl">
        <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-1">Acreedor</label>
            <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Ej. Visa" />
        </div>
        <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-1">Valor Deuda</label>
            <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white font-bold outline-none"
                value={form.monto_total} onChange={e => setForm({...form, monto_total: e.target.value})} required />
        </div>
        <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-1">Tasa Mensual (%)</label>
            <input type="number" step="0.01" className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white font-bold outline-none"
                value={form.tasa_interes} onChange={e => setForm({...form, tasa_interes: e.target.value})} required />
        </div>
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3.5 rounded-xl uppercase text-xs transition-all shadow-lg">
          Crear Registro
        </button>
      </form>

      {/* LISTADO CON PROGRESO */}
      <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-slate-500 text-[10px] uppercase font-black">
            <tr>
              <th className="p-6">Información</th>
              <th className="p-6 text-center">Progreso</th>
              <th className="p-6 text-center">Interés Mensual</th>
              <th className="p-6 text-right px-12">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {deudas.map((deu) => {
              const porcentaje = ((deu.monto_total - deu.monto_pendiente) / deu.monto_total) * 100;
              const interesEstimado = deu.monto_pendiente * (deu.tasa_interes / 100);

              return (
                <tr key={deu.id} className="hover:bg-slate-800/40 transition-all group">
                  <td className="p-6">
                    <p className="text-white font-black text-sm uppercase italic">{deu.nombre}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-tighter">BASE: ${deu.monto_total.toLocaleString()}</p>
                  </td>
                  <td className="p-6 w-1/4">
                    <div className="flex justify-between text-[9px] font-black mb-1">
                      <span className="text-amber-500">DEBES: ${deu.monto_pendiente.toLocaleString()}</span>
                      <span className="text-slate-400">{porcentaje.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full border border-slate-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${porcentaje}%` }} className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <p className="text-rose-400 font-black text-lg">-${interesEstimado.toLocaleString()}</p>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Pérdida por Interés</p>
                  </td>
                  <td className="p-6 text-right px-12">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setAbonoId(deu.id)} className="bg-green-500/10 text-green-500 p-2.5 rounded-xl hover:bg-green-500 hover:text-white transition-all">
                            <ArrowUpCircle size={20} />
                        </button>
                        <button onClick={async () => { if(confirm("¿Eliminar?")) { await api.delete(`/deudas/${deu.id}`); fetchData(); } }} className="text-slate-600 hover:text-rose-500 p-2.5 transition-colors">
                            <Trash2 size={20}/>
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* POPUP DE ABONO */}
      <AnimatePresence>
        {abonoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e293b] border-2 border-green-500 p-8 rounded-[3rem] shadow-2xl w-full max-w-sm">
                <h3 className="text-white font-black italic text-xl mb-2 uppercase tracking-tighter">Nuevo Abono</h3>
                <p className="text-slate-400 text-[10px] mb-6 font-bold uppercase tracking-widest leading-relaxed">
                   Se pagará primero el interés mensual y el sobrante irá a capital.
                </p>
                <input type="number" placeholder="0.00" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl text-white font-black text-2xl mb-6 outline-none focus:border-green-500 text-center"
                    value={montoAbono} onChange={e => setMontoAbono(e.target.value)} autoFocus />
                <div className="flex gap-3">
                    <button onClick={() => registrarAbono(deudas.find(d => d.id === abonoId))} className="flex-1 bg-green-500 text-slate-900 font-black py-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Confirmar</button>
                    <button onClick={() => setAbonoId(null)} className="flex-1 bg-slate-800 text-slate-400 font-black py-4 rounded-2xl uppercase text-xs tracking-widest active:scale-95 transition-all">Cerrar</button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeudaPage;