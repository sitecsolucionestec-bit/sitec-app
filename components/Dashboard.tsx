
import React from 'react';
import { Users, Calendar as CalendarIcon, AlertTriangle, FileText } from 'lucide-react';
import { AppState, VisitStatus } from '../types';

interface DashboardProps {
  data: AppState;
  setActiveTab: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const pendingVisits = data.visits.filter(v => v.status === VisitStatus.PENDING).length;
  const maintenanceAlerts = data.maintenance.filter(m => m.status !== 'Done').length;
  const activeQuotes = data.quotes.filter(q => q.status === 'Sent' || q.status === 'Draft').length;

  const stats = [
    { label: 'Clientes', value: data.clients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Visitas Pendientes', value: pendingVisits, icon: CalendarIcon, color: 'bg-orange-500' },
    { label: 'Mantenimientos', value: maintenanceAlerts, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Cotizaciones', value: activeQuotes, icon: FileText, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Bienvenido al sistema SITEC</h3>
        <p className="text-gray-600">Utilice el menú de la izquierda para gestionar las operaciones diarias de la empresa.</p>
      </div>
    </div>
  );
};

export default Dashboard;
