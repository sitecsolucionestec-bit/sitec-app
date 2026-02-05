export enum VisitStatus {
  PENDING = 'Pendiente',
  CONFIRMED = 'Confirmada',
  IN_PROGRESS = 'En Proceso',
  COMPLETED = 'Completada',
  CANCELLED = 'Cancelada'
}

export type ServiceType = 'Venta' | 'Mantenimiento' | 'Instalación';

export interface Client {
  id: string;
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  clientId: string;
  date: string;
  serviceTypes: ServiceType[];
  items: QuoteItem[];
  laborCost: number;
  subtotalItems: number;
  subtotalGeneral: number;
  iva: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  observations?: string;
  commercialConditions?: string;
}

export interface Visit {
  id: string;
  clientId: string;
  technicianId: string;
  date: string;
  time: string;
  description: string;
  status: VisitStatus;
  address: string;
}

export interface ExecutionReport {
  id: string;
  visitId: string;
  clientId: string;
  quoteId?: string;
  date: string;
  activities: string;
  equipmentIntervened: string;
  observations: string;
  warrantyMonths: number;
  clientSignature?: string; 
}

export interface MaintenanceAlert {
  id: string;
  clientId: string;
  systemType: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: 'Upcoming' | 'Overdue' | 'Done';
}

export interface SyncConfig {
  enabled: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  lastSync?: string;
}

export interface AppState {
  clients: Client[];
  technicians: Technician[];
  quotes: Quote[];
  visits: Visit[];
  reports: ExecutionReport[];
  maintenance: MaintenanceAlert[];
  syncConfig?: SyncConfig;
}