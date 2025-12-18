import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, ArrowUpCircle, TrendingDown, 
  Wallet, Zap, X, Trophy, PartyPopper, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeudaPage = () => {
  const [deudas, setDeudas] = useState([]);
  const [saldoReal, setSaldoReal] = useState(0); 
  const [abonoId, setAbonoId] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [isSyncing, setIsSyncing] = useState(false); // Estado para evitar el F5

  const [form, setForm] = useState({ 
    nombre: '', 
    monto_total: '', 
    tasa_interes: '', 
    fecha_limite: new Date().toISOString().split('T')[0] 
  });

  // CARGA DE DATOS OPTIMIZADA
  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const [resD, resI, resG] = await Promise.all([
        api.get('/deudas/'), 
        api.get('/ingresos/'), 
        api.get('/gastos/')
      ]);
      
      setDeudas(resD.data || []);
      
      const totalI = resI.data.reduce((a, b) => a + Number(b.monto), 0);
      const totalG = resG.data.reduce((a, b) => a + Number(b.monto), 0);
      setSaldoReal(totalI - totalG);
    } catch (err) { 
      console.error("Error cargando de PostgreSQL:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500); // Pequeño delay visual de fluidez
    }
  };

  useEffect(() => { fetchData(); }, []);

  // CREAR REGISTRO SIN F5
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
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
      
      // Esperamos a que la base de datos confirme y refrescamos
      await fetchData(); 
    } catch (err) { 
      alert("Error al guardar en base de datos");
      setIsSyncing(false);
    }
  };

  // REGISTRAR ABONO SIN F5
  const registrarAbono = async (deuda) => {
    const valor = parseFloat(montoAbono);
    if (!valor || valor <= 0) return;
    
    const interesMes = deuda.monto_pendiente * (deuda.tasa_interes / 100);
    const abonoCapital = valor - interesMes;
    
    if (abonoCapital <= 0) { 
      alert("El abono no alcanza a cubrir los intereses mensuales."); 
      return; 
    }

    const nuevoPendiente = Math.max(0, deuda.monto_pendiente - abonoCapital);

    try {
      setIsSyncing(true);
      // Enviamos el parche y ESPERAMOS la respuesta
      await api.patch(`/deudas/${deuda.id}`, { monto_pendiente: nuevoPendiente });
      
      setAbonoId(null);
      setMontoAbono('');
      
      // Refresco automático de PostgreSQL
      await fetchData();
    } catch (err) { 
      alert("Error al procesar inyección de capital");
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6 text-left min-h-screen relative">
      
      {/* INDICADOR DE SINCRONIZACIÓN (Para saber que está trabajando) */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-10 right-10 z-[100] bg-orange-500 text-black px-4 py-2 rounded-full font-black text-[10px] flex items-center gap-2 shadow-lg">
            <Loader2 className="animate-spin" size={14} /> SINCRONIZANDO DB
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-4 rounded-full border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <TrendingDown className="text-orange-500" size={36} />
          </div>
          <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">DEUDAS</h2>
        </div>

        <div className="bg-[#0f172a]/90 border-2 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.2)] px-10 py-5 rounded-2xl flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] mb-1 italic">Sueldo Disponible</p>
            <p className="text-4xl font-black text-white italic tracking-tighter">${saldoReal.toLocaleString()}</p>
          </div>
          <Zap className="text-orange-500" size={28} fill="currentColor" />
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-[#1e293b]/30 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 italic">Protocolo de Deuda</label>
            <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500 text-sm"
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Banco" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 italic">Monto Objetivo</label>
            <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500 text-sm"
              value={form.monto_total} onChange={e => setForm({...form, monto_total: e.target.value})} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 italic">Tasa Mensual %</label>
            <input type="number" step="0.01" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500 text-sm"
              value={form.tasa_interes} onChange={e => setForm({...form, tasa_interes: e.target.value})} placeholder="0.0%" required />
          </div>
          <button type="submit" disabled={isSyncing} className="bg-orange-500 hover:bg-orange-400 text-black font-black py-4.5 rounded-xl uppercase text-xs transition-all shadow-lg italic flex items-center justify-center gap-2">
            {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} strokeWidth={4} />} INICIAR REGISTRO
          </button>
        </form>
      </div>

      {/* LISTADO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence>
          {deudas.map((deu) => {
            const porcentaje = ((deu.monto_total - deu.monto_pendiente) / deu.monto_total) * 100;
            const isCompleted = porcentaje >= 100;
            return (
              <motion.div key={deu.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`bg-[#1e293b]/40 rounded-[2.5rem] p-8 border ${isCompleted ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-slate-800'} shadow-2xl relative group`}>
                
                <button onClick={async () => { if(confirm("¿Eliminar?")) { await api.delete(`/deudas/${deu.id}`); fetchData(); } }} 
                  className="absolute top-6 right-8 text-slate-600 hover:text-rose-500 transition-colors">
                  <Trash2 size={20} />
                </button>

                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">{deu.nombre}</h3>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Liquidación</span>
                  <span className={`${isCompleted ? 'text-green-500 font-bold' : 'text-orange-500'} text-xs font-black`}>
                    {porcentaje.toFixed(1)} %
                  </span>
                </div>
                
                <div className="w-full h-3 bg-slate-900/50 rounded-full mb-8 overflow-hidden border border-slate-800 p-[1px]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${porcentaje}%` }} 
                    className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-orange-500'} rounded-full transition-all duration-700`} />
                </div>

                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase mb-1 italic">Status Pendiente</p>
                    <p className={`text-3xl font-black italic tracking-tighter ${isCompleted ? 'text-green-500' : 'text-white'}`}>
                      ${Number(deu.monto_pendiente).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-rose-500 font-black uppercase mb-1 italic tracking-widest">Interés Mes</p>
                    <p className="text-xl font-black text-rose-500 italic tracking-tighter">
                      -${(deu.monto_pendiente * (deu.tasa_interes / 100)).toLocaleString()}
                    </p>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="w-full bg-green-500/10 border border-green-500/50 text-green-500 font-black py-4.5 rounded-2xl flex justify-center items-center gap-3 uppercase italic text-sm">
                    <Trophy size={18} /> Protocolo Completado
                  </div>
                ) : (
                  <button onClick={() => setAbonoId(deu.id)}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-4.5 rounded-2xl flex justify-center items-center gap-3 transition-all uppercase italic text-sm shadow-lg shadow-orange-500/10 active:scale-95">
                    <ArrowUpCircle size={20} strokeWidth={3} /> Registrar Abono
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* MODAL NARANJA */}
      <AnimatePresence>
        {abonoId && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#1e293b] border-2 border-orange-500 p-10 rounded-[3rem] shadow-[0_0_60px_rgba(249,115,22,0.3)] w-full max-w-sm relative">
                <button onClick={() => {setAbonoId(null); setMontoAbono('');}} className="absolute top-6 right-8 text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <h3 className="text-white font-black italic text-2xl mb-2 uppercase tracking-tighter text-center">Inyectar Abono</h3>
                <p className="text-slate-400 text-[10px] mb-8 font-bold uppercase tracking-widest text-center italic">
                   Liquidando protocolo para: <br/>
                   <span className="text-orange-500">{deudas.find(d => d.id === abonoId)?.nombre}</span>
                </p>
                <input type="number" placeholder="$ 0.00" className="w-full bg-[#0f172a] border border-slate-700 p-5 rounded-2xl text-white font-black text-4xl mb-8 outline-none focus:border-orange-500 text-center"
                  value={montoAbono} onChange={e => setMontoAbono(e.target.value)} autoFocus />
                <div className="flex gap-4">
                  <button onClick={() => registrarAbono(deudas.find(d => d.id === abonoId))} disabled={isSyncing} className="flex-[2] bg-orange-500 text-black font-black py-4.5 rounded-2xl uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                    {isSyncing ? "PROCESANDO..." : "CONFIRMAR"}
                  </button>
                  <button onClick={() => {setAbonoId(null); setMontoAbono('');}} className="flex-1 bg-slate-800 text-slate-400 font-black py-4.5 rounded-2xl uppercase text-xs tracking-widest">Cerrar</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeudaPage;