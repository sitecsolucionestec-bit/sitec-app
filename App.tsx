import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  ClipboardCheck, 
  Bell, 
  Users, 
  Menu, 
  X,
  Briefcase,
  Settings
} from 'lucide-react';
import { AppState } from './types';
import { loadData, saveData } from './utils';
import Dashboard from './components/Dashboard';
import QuotesModule from './components/QuotesModule';
import AgendaModule from './components/AgendaModule';
import ReportsModule from './components/ReportsModule';
import MaintenanceModule from './components/MaintenanceModule';
import ClientsModule from './components/ClientsModule';
import TechniciansModule from './components/TechniciansModule';
import SettingsModule from './components/SettingsModule';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quotes' | 'agenda' | 'reports' | 'maintenance' | 'clients' | 'technicians' | 'settings'>('dashboard');
  const [data, setData] = useState<AppState>(loadData());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'technicians', label: 'Técnicos', icon: Briefcase },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'agenda', label: 'Agenda y Visitas', icon: Calendar },
    { id: 'reports', label: 'Reportes de Trabajo', icon: ClipboardCheck },
    { id: 'maintenance', label: 'Mantenimiento', icon: Bell },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-md lg:hidden shadow-lg"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex flex-col items-center">
            <div className="w-full text-center mb-6">
               <h1 className="text-orange-500 font-bold text-3xl tracking-tighter">SITEC</h1>
               <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Soluciones Tecnológicas</p>
            </div>
            <div className="h-px w-full bg-slate-800" />
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${activeTab === item.id 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 bg-slate-800 m-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                AD
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Administrador</p>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${data.syncConfig?.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">{data.syncConfig?.enabled ? 'Cloud Activo' : 'Solo Local'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 hidden lg:flex">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
             {data.syncConfig?.lastSync && (
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sincronizado: {new Date(data.syncConfig.lastSync).toLocaleTimeString()}</span>
             )}
             <span className="text-sm font-medium text-gray-600">Hoy: {new Date().toLocaleDateString('es-CO')}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard data={data} setActiveTab={setActiveTab} />}
          {activeTab === 'clients' && <ClientsModule data={data} setData={setData} />}
          {activeTab === 'technicians' && <TechniciansModule data={data} setData={setData} />}
          {activeTab === 'quotes' && <QuotesModule data={data} setData={setData} />}
          {activeTab === 'agenda' && <AgendaModule data={data} setData={setData} />}
          {activeTab === 'reports' && <ReportsModule data={data} setData={setData} />}
          {activeTab === 'maintenance' && <MaintenanceModule data={data} setData={setData} />}
          {activeTab === 'settings' && <SettingsModule data={data} setData={setData} />}
        </div>
      </main>
    </div>
  );
};

export default App;