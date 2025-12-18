import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, ArrowUpCircle, TrendingDown, Check, X, 
  Zap, DollarSign, AlertTriangle 
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
    } catch (err) { alert("Error al procesar el abono"); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 text-left">
      
      {/* HEADER & SALDO WIDGET */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <TrendingDown className="text-amber-500 animate-bounce" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Protocolo_Deuda</h2>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">Gestión de Pasivos Activos</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a] border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] px-8 py-4 rounded-[2rem] flex items-center gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl"></div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Saldo Libre de Deuda</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">
              ${saldo.toLocaleString('es-CO')}
            </p>
          </div>
          <Zap className="text-amber-400 fill-amber-400 ml-2" size={20} />
        </motion.div>
      </div>

      {/* FORMULARIO DE REGISTRO NEÓN */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-[#1e293b]/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        
        <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Acreedor / Entidad</label>
            <input type="text" className="w-full bg-[#0f172a] border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all text-sm font-bold"
                value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="EJ: BANCO GALAXY" />
        </div>
        <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Monto Total</label>
            <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all text-sm font-bold"
                value={form.monto_total} onChange={e => setForm({...form, monto_total: e.target.value})} required placeholder="0.00" />
        </div>
        <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Tasa Mensual %</label>
            <input type="number" step="0.01" className="w-full bg-[#0f172a] border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all text-sm font-bold"
                value={form.tasa_interes} onChange={e => setForm({...form, tasa_interes: e.target.value})} required placeholder="0.0%" />
        </div>
        
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 uppercase text-xs italic tracking-tighter">
          <Plus size={18} strokeWidth={3} /> Iniciar Registro
        </button>
      </motion.form>

      {/* LISTADO DE DEUDAS (CARDS ESTILO META) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {deudas.map((deu) => {
            const porcentaje = ((deu.monto_total - deu.monto_pendiente) / deu.monto_total) * 100;
            const interesEstimado = deu.monto_pendiente * (deu.tasa_interes / 100);

            return (
              <motion.div 
                layout key={deu.id}
                className="bg-[#1e293b] border border-slate-700 rounded-[2rem] p-6 space-y-4 shadow-xl hover:border-amber-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-all"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">{deu.nombre}</h3>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Crédito Base: ${deu.monto_total.toLocaleString()}</p>
                  </div>
                  <button onClick={async () => { if(confirm("¿Eliminar?")) { await api.delete(`/deudas/${deu.id}`); fetchData(); } }} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </div>

                {/* BARRA DE PROGRESO DE PAGO */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500 italic">Liquidación</span>
                    <span className="text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]">{porcentaje.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-[3px] border border-slate-700">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${porcentaje}%` }} 
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full relative"
                    >
                      <div className="absolute top-0 right-0 w-2 h-full bg-white blur-[2px] opacity-30"></div>
                    </motion.div>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Deuda Pendiente</p>
                    <p className="text-2xl font-black text-white italic">${deu.monto_pendiente.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-rose-500 uppercase font-black tracking-tighter flex items-center gap-1 justify-end">
                      <AlertTriangle size={10}/> Interés Mes
                    </p>
                    <p className="text-lg font-black text-rose-400 tracking-tighter">-${interesEstimado.toLocaleString()}</p>
                  </div>
                </div>

                {/* BOTÓN ABONAR (ESTILO INYECTAR CAPITAL) */}
                <button 
                  onClick={() => setAbonoId(deu.id)}
                  className="w-full mt-4 bg-amber-500 text-[#0f172a] font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:bg-amber-400 active:scale-95 text-xs uppercase italic"
                >
                  <ArrowUpCircle size={18} strokeWidth={3}/> REGISTRAR ABONO
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* POPUP DE ABONO REDISEÑADO */}
      <AnimatePresence>
        {abonoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#1e293b] border-2 border-amber-500 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] w-full max-w-sm relative">
                
                <div className="absolute top-6 right-8 text-amber-500/20"><Zap size={40} fill="currentColor"/></div>

                <h3 className="text-white font-black italic text-2xl mb-2 uppercase tracking-tighter">Inyectar Abono</h3>
                <p className="text-slate-400 text-[10px] mb-8 font-black uppercase tracking-[0.2em] leading-relaxed">
                   Se priorizará el pago de intereses (${(deudas.find(d => d.id === abonoId)?.monto_pendiente * (deudas.find(d => d.id === abonoId)?.tasa_interes / 100)).toLocaleString()}).
                </p>

                <div className="relative mb-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black text-xl">$</span>
                  <input type="number" placeholder="0.00" className="w-full bg-[#0f172a] border-2 border-slate-700 p-5 pl-10 rounded-2xl text-white font-black text-3xl outline-none focus:border-amber-500 transition-all text-center"
                    value={montoAbono} onChange={e => setMontoAbono(e.target.value)} autoFocus />
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={() => registrarAbono(deudas.find(d => d.id === abonoId))} className="w-full bg-amber-500 text-slate-900 font-black py-5 rounded-2xl uppercase text-sm italic tracking-tighter shadow-xl hover:bg-amber-400 active:scale-95 transition-all">Confirmar Transacción</button>
                    <button onClick={() => setAbonoId(null)} className="w-full bg-transparent text-slate-500 font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancelar</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeudaPage;