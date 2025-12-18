import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Zap, Target, Calendar, DollarSign, X, TrendingUp, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CadenaPage = () => {
    const [cadenas, setCadenas] = useState([]);
    const [selectedCadena, setSelectedCadena] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showAbonoModal, setShowAbonoModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Formulario de Meta (Jesús)
    const [planForm, setPlanForm] = useState({ meta: '', fecha: '', cuota: '' });
    // Formulario de Abono
    const [abonoMonto, setAbonoMonto] = useState('');

    useEffect(() => {
        fetchCadenas();
    }, []);

    const fetchCadenas = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cadenas/');
            setCadenas(res.data);
            if (selectedCadena) {
                const updated = res.data.find(c => c.id === selectedCadena.id);
                if (updated) setSelectedCadena(updated);
            }
        } catch (err) {
            console.error("Error cargando cadenas", err);
        } finally {
            setLoading(false);
        }
    };

    const guardarMeta = async () => {
        try {
            await api.patch(`/cadenas/${selectedCadena.id}/meta`, {
                meta_ahorro: parseFloat(planForm.meta),
                fecha_cobro: planForm.fecha,
                cuota_pactada: parseFloat(planForm.cuota)
            });
            setShowPlanModal(false);
            fetchCadenas();
        } catch (err) { alert("Error al guardar meta"); }
    };

    const registrarAbono = async () => {
        try {
            await api.post(`/cadenas/${selectedCadena.id}/abonar`, {
                monto: parseFloat(abonoMonto)
            });
            setShowAbonoModal(false);
            setAbonoMonto('');
            fetchCadenas();
        } catch (err) { alert("Error al registrar abono"); }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 text-left">
            {/* HEADER */}
            <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <Zap className="text-yellow-400 fill-yellow-400" /> SISTEMA DE CADENAS
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Gestión de ahorro programado v1.0</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* LISTA DE GRUPOS */}
                <div className="space-y-3">
                    <h3 className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Tus Grupos</h3>
                    {cadenas.map(cadena => (
                        <button 
                            key={cadena.id} 
                            onClick={() => setSelectedCadena(cadena)}
                            className={`w-full p-5 rounded-[2rem] border transition-all ${selectedCadena?.id === cadena.id ? 'bg-yellow-400 border-yellow-400' : 'bg-[#1e293b] border-slate-800'}`}
                        >
                            <p className={`font-black uppercase italic text-sm ${selectedCadena?.id === cadena.id ? 'text-black' : 'text-white'}`}>{cadena.nombre}</p>
                            <p className={`text-[9px] font-bold ${selectedCadena?.id === cadena.id ? 'text-black/60' : 'text-slate-500'}`}>{cadena.participantes?.length || 0} MIEMBROS</p>
                        </button>
                    ))}
                </div>

                {/* PANEL DETALLES Y MIEMBROS */}
                <div className="lg:col-span-3">
                    {selectedCadena ? (
                        <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700 p-8 shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedCadena.nombre}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowPlanModal(true)} className="bg-white/5 hover:bg-white/10 text-white text-[9px] font-black px-4 py-2 rounded-full border border-white/10 uppercase">Configurar Mi Meta</button>
                                    <button onClick={() => setShowAbonoModal(true)} className="bg-yellow-400 text-black text-[9px] font-black px-4 py-2 rounded-full uppercase">Registrar Abono</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedCadena.participantes?.map((p, idx) => {
                                    const progreso = p.meta_ahorro > 0 ? (p.saldo_actual / p.meta_ahorro) * 100 : 0;
                                    return (
                                        <div key={idx} className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                        <User size={14} className="text-slate-400" />
                                                    </div>
                                                    <p className="text-white font-black text-xs uppercase tracking-wider">{p.usuario?.nombre || 'Usuario'}</p>
                                                </div>
                                                {p.es_organizador && <span className="text-[8px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black uppercase">Líder</span>}
                                            </div>

                                            {/* BARRA DE PROGRESO */}
                                            <div className="space-y-2 mb-6">
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span className="text-slate-500 tracking-widest">Ahorro Acumulado</span>
                                                    <span className="text-yellow-400">{progreso.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-900 rounded-full border border-white/5">
                                                    <motion.div 
                                                        initial={{ width: 0 }} 
                                                        animate={{ width: `${progreso}%` }} 
                                                        className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-2xl">
                                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Meta</p>
                                                    <p className="text-xs font-black text-white">${Number(p.meta_ahorro).toLocaleString()}</p>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-2xl">
                                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Saldo</p>
                                                    <p className="text-xs font-black text-green-400">${Number(p.saldo_actual).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex items-center gap-2 text-slate-500">
                                                <Calendar size={10} />
                                                <p className="text-[8px] font-black uppercase">Cobro: {p.fecha_cobro || 'Pendiente'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-700 font-black uppercase text-[10px] tracking-[0.4em]">
                            Selecciona una cadena de ahorro
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL META (PLAN DE JESÚS) */}
            <AnimatePresence>
                {showPlanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#1e293b] border border-slate-700 p-8 rounded-[3rem] w-full max-w-md">
                            <h3 className="text-white font-black uppercase italic text-xl mb-6">Configurar Plan Personal</h3>
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1">Meta de Ahorro ($)</label>
                                    <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl text-white font-bold" 
                                        placeholder="5000000" value={planForm.meta} onChange={e => setPlanForm({...planForm, meta: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1">Fecha de Cobro Estimada</label>
                                    <input type="date" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl text-white font-bold" 
                                        value={planForm.fecha} onChange={e => setPlanForm({...planForm, fecha: e.target.value})} />
                                </div>
                                <button onClick={guardarMeta} className="w-full bg-yellow-400 text-black font-black py-4 rounded-2xl uppercase text-[11px] mt-4">Actualizar Plan</button>
                                <button onClick={() => setShowPlanModal(false)} className="w-full text-slate-500 font-black py-2 uppercase text-[9px]">Cancelar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL ABONO (PAGAR QUINCENA) */}
            <AnimatePresence>
                {showAbonoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#1e293b] border border-slate-700 p-8 rounded-[3rem] w-full max-w-sm">
                            <h3 className="text-white font-black uppercase italic text-xl mb-6">Registrar Abono</h3>
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1">Monto a Entregar</label>
                                    <input type="number" className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl text-white font-bold text-2xl" 
                                        placeholder="250000" value={abonoMonto} onChange={e => setAbonoMonto(e.target.value)} />
                                </div>
                                <button onClick={registrarAbono} className="w-full bg-green-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] mt-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]">Confirmar Pago</button>
                                <button onClick={() => setShowAbonoModal(false)} className="w-full text-slate-500 font-black py-2 uppercase text-[9px]">Cerrar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CadenaPage;