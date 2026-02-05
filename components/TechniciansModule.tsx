
import React, { useState } from 'react';
import { Briefcase, Phone, Mail, Plus, X, Edit, Trash2, Award } from 'lucide-react';
import { AppState, Technician } from '../types';

interface TechniciansModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const TechniciansModule: React.FC<TechniciansModuleProps> = ({ data, setData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [formState, setFormState] = useState<Partial<Technician>>({ name: '', specialty: 'CCTV y Seguridad', phone: '', email: '' });

  const handleOpenForm = (tech?: Technician) => {
    if (tech) {
      setEditingTech(tech);
      setFormState(tech);
    } else {
      setEditingTech(null);
      setFormState({ name: '', specialty: 'CCTV y Seguridad', phone: '', email: '' });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formState.name) return;
    
    if (editingTech) {
      const updated = data.technicians.map(t => t.id === editingTech.id ? { ...formState as Technician } : t);
      setData({ ...data, technicians: updated });
    } else {
      const newTech: Technician = { 
        ...formState as Technician, 
        id: 't' + Date.now().toString().slice(-4)
      };
      setData({ ...data, technicians: [newTech, ...data.technicians] });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Desea retirar definitivamente a este técnico de la nómina de SITEC S.A.S.?')) {
      setData({ ...data, technicians: data.technicians.filter(t => t.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recurso Humano Técnico</h2>
          <p className="text-sm text-gray-500">Gestión de especialistas y perfiles operativos SITEC.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg hover:scale-105 active:scale-95">
          <Plus size={20} /> <span>Vincular Técnico</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.technicians.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-orange-500/50 hover:shadow-xl transition-all group relative overflow-hidden">
             <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500/5 rounded-full group-hover:bg-orange-500/10 transition-colors" />
             
             <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenForm(t)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all" title="Editar Perfil">
                <Edit size={16}/>
              </button>
              <button onClick={() => handleDelete(t.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Desvincular">
                <Trash2 size={16}/>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-slate-900 text-orange-500 rounded-[1.25rem] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <Briefcase size={28} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg leading-tight">{t.name}</h4>
                <div className="flex items-center mt-1">
                  <Award size={12} className="text-orange-500 mr-1"/>
                  <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">{t.specialty}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-50 text-sm text-slate-500">
              <div className="flex items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Phone size={14} className="mr-3 text-slate-400"/> 
                <span className="font-bold text-slate-700">{t.phone}</span>
              </div>
              <div className="flex items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Mail size={14} className="mr-3 text-slate-400"/> 
                <span className="font-medium text-slate-600 truncate">{t.email}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">SITEC ID: {t.id}</span>
              <div className="flex -space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 space-y-6 shadow-2xl relative border border-white/20">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 p-2.5 hover:bg-gray-100 rounded-full text-gray-400"><X/></button>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-900 rounded-2xl text-orange-500 shadow-xl">
                <Briefcase size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {editingTech ? 'Actualizar Perfil' : 'Nuevo Colaborador'}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                <input className="w-full border border-gray-100 p-4 rounded-2xl outline-none transition-all bg-gray-50 font-bold text-slate-700 focus:ring-4 focus:ring-slate-100 focus:border-slate-300" placeholder="Ej: Juan Pérez Gómez" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Área de Especialidad</label>
                <select className="w-full border border-gray-100 p-4 rounded-2xl outline-none transition-all bg-gray-50 font-bold text-slate-700 focus:ring-4 focus:ring-slate-100 focus:border-slate-300 cursor-pointer" value={formState.specialty} onChange={e => setFormState({...formState, specialty: e.target.value})}>
                  <option>CCTV y Seguridad</option>
                  <option>Redes y Telecomunicaciones</option>
                  <option>Software y Soporte</option>
                  <option>Infraestructura Eléctrica</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Celular Corp.</label>
                  <input className="w-full border border-gray-100 p-4 rounded-2xl outline-none transition-all bg-gray-50 font-bold text-slate-700 focus:ring-4 focus:ring-slate-100 focus:border-slate-300" placeholder="300..." value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Corp.</label>
                  <input className="w-full border border-gray-100 p-4 rounded-2xl outline-none transition-all bg-gray-50 font-bold text-slate-700 focus:ring-4 focus:ring-slate-100 focus:border-slate-300" placeholder="user@sitec.com" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
               <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200">Descartar</button>
               <button onClick={handleSave} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                {editingTech ? 'Guardar Cambios' : 'Vincular Técnico'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansModule;
