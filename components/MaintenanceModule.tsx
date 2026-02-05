
import React from 'react';
import { Plus, Bell, Shield } from 'lucide-react';
import { AppState } from '../types';

interface MaintenanceModuleProps {
  data: AppState;
  setData: React.Dispatch<React.SetStateAction<AppState>>;
}

const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mantenimiento Preventivo</h2>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 transition-colors">
          <Plus size={20} /> <span>Registrar Sistema</span>
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-start space-x-4 mb-8">
        <div className="bg-orange-500 p-3 rounded-xl text-white">
          <Bell size={24} />
        </div>
        <div>
          <h4 className="font-bold text-orange-800">Alertas Automáticas</h4>
          <p className="text-orange-700 text-sm mt-1">
            El sistema generará recordatorios automáticos cada 6 meses para los sistemas de CCTV y alarmas instalados.
          </p>
        </div>
      </div>

      <div className="bg-white p-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-3xl flex flex-col items-center">
         <Shield size={48} className="mb-4 opacity-20" />
         <p className="italic">Configure los sistemas instalados por cliente para iniciar el seguimiento preventivo.</p>
      </div>
    </div>
  );
};

export default MaintenanceModule;
