
import { AppState, Quote, Client } from './types';

const STORAGE_KEY = 'sitec_app_data';

export const DEFAULT_QUOTE_OBSERVATIONS = `- Cliente suministra todos los accesos requeridos de altura, escaleras, manlift, andamios, etc.\n- No incluye recargo de trabajo nocturno, ni presencia de personal siso, de ser necesario o requerido, el costo será asumido por el cliente.\n- Tiempo de trabajo estimado: Según cronograma.\n- No incluye canaletas, tuberías y puntos de corriente.`;

export const DEFAULT_COMMERCIAL_CONDITIONS = `Moneda: Pesos Colombianos (COP)
Forma de pago: 50% Anticipo - 50% Entrega
Vigencia: 15 días calendario
Garantía: Un (1) año por defectos de fábrica
Entrega: Según disponibilidad técnica
Obras Civiles: No incluidas
Infraestructura: Suministrada por el cliente`;

export const SITEC_BANK_INFO = "BANCOLOMBIA N° CUENTA AHORRO: 67800017190 - SITEC SOLUCIONES TECNOLOGICAS INTEGRALES SAS NIT 901806525-3";

export const initialData: AppState = {
  clients: [
    { id: '1', name: 'Clínica Salud Total', nit: '900.123.456-1', address: 'Calle 100 #15-20', phone: '3001234567', email: 'mantenimiento@saludtotal.com', contactPerson: 'Ing. Carlos Ruiz' },
    { id: '2', name: 'Edificio Horizonte', nit: '800.987.654-2', address: 'Av. Siempre Viva 123', phone: '3117654321', email: 'admin@horizonte.com', contactPerson: 'Marta Lucia' }
  ],
  technicians: [
    { id: 't1', name: 'Juan Pérez', specialty: 'CCTV y Seguridad', phone: '3001112233', email: 'juan.perez@sitec.com' },
    { id: 't2', name: 'Andrés Gómez', specialty: 'Redes y Telecomunicaciones', phone: '3004445566', email: 'andres.gomez@sitec.com' }
  ],
  quotes: [],
  visits: [],
  reports: [],
  maintenance: []
};

export const loadData = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

export const saveData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

export const generatePDF = (title: string, content: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; }
          .logo-text { color: #10b981; font-size: 32px; font-weight: bold; margin: 0; }
          h1 { color: #1e293b; font-size: 20px; margin-top: 0; }
          pre { white-space: pre-wrap; font-family: 'Helvetica', sans-serif; font-size: 14px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; color: #374151; }
          .footer { margin-top: 40px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="logo-text">SITEC</p>
          <div style="text-align: right; font-size: 12px; color: #666;">
            <strong>SITEC SOLUCIONES TECNOLOGICAS INTEGRALES S.A.S.</strong><br>
            NIT 901806525-3
          </div>
        </div>
        <h1>${title}</h1>
        <pre>${content}</pre>
        <div class="footer">
          <p>SITEC SOLUCIONES TECNOLOGICAS INTEGRALES S.A.S. - Reporte Generado el ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const generateQuotePDF = (quote: Quote, client: Client | undefined) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = quote.items.map((item, index) => `
    <tr>
      <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
      <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
      <td style="text-align: right; border: 1px solid #ddd; padding: 8px;">${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right; border: 1px solid #ddd; padding: 8px;">${formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');

  const servicesText = quote.serviceTypes?.join(' / ') || 'Servicios Técnicos Generales';

  printWindow.document.write(`
    <html>
      <head>
        <title>Cotización SITEC - ${quote.id}</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 20px; margin-bottom: 20px; }
          .logo-text { color: #f97316; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: -1px; }
          .company-info { font-size: 11px; color: #666; margin-top: 5px; }
          .quote-title { text-align: right; }
          .quote-title h2 { color: #f97316; margin: 0; font-size: 26px; font-weight: 900; }
          .client-info { background: #f9fafb; padding: 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; border: 1px solid #e5e7eb; }
          .client-info table { width: 100%; border-collapse: collapse; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          .items-table th { background: #1e293b; color: white; padding: 12px 10px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
          .totals-table { width: 320px; margin-left: auto; border-collapse: collapse; font-size: 13px; }
          .totals-table td { padding: 6px; border-bottom: 1px solid #f3f4f6; }
          .totals-table .total-row { border-top: 2px solid #f97316; font-weight: bold; font-size: 16px; color: #f97316; }
          .conditions { font-size: 11px; margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .conditions-box { border: 1px solid #e5e7eb; padding: 15px; border-radius: 10px; background: #fff; }
          .conditions-box strong { color: #1e293b; display: block; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <p class="logo-text">SITEC</p>
            <div class="company-info">
              <strong>SITEC SOLUCIONES TECNOLOGICAS INTEGRALES S.A.S.</strong><br>
              NIT 901806525-3<br>
              Seguridad Electrónica, Redes y Soluciones Tecnológicas
            </div>
          </div>
          <div class="quote-title">
            <h2>COTIZACIÓN</h2>
            <p style="margin: 5px 0;"><strong>Consecutivo:</strong> ${quote.id}</p>
            <p style="margin: 5px 0;"><strong>Fecha Emisión:</strong> ${quote.date}</p>
            <div style="margin-top: 10px; padding: 5px 10px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 6px; display: inline-block;">
              <strong style="color: #c2410c; font-size: 11px;">SERVICIOS: ${servicesText}</strong>
            </div>
          </div>
        </div>

        <div class="client-info">
          <table>
            <tr>
              <td width="50%"><strong>Cliente:</strong> ${client?.name || 'N/A'}</td>
              <td width="50%"><strong>NIT/CC:</strong> ${client?.nit || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Dirección:</strong> ${client?.address || 'N/A'}</td>
              <td><strong>Contacto:</strong> ${client?.contactPerson || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th width="40">Item</th>
              <th>Descripción Detallada del Equipo / Suministro</th>
              <th width="60">Cant.</th>
              <th width="100">Vr. Unitario</th>
              <th width="120">Vr. Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Subtotal Equipos y Materiales:</td>
            <td style="text-align: right;">${formatCurrency(quote.subtotalItems)}</td>
          </tr>
          <tr>
            <td>Servicio Instalación y Configuración:</td>
            <td style="text-align: right;">${formatCurrency(quote.laborCost)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Subtotal General:</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(quote.subtotalGeneral)}</td>
          </tr>
          <tr>
            <td>IVA (19%):</td>
            <td style="text-align: right;">${formatCurrency(quote.iva)}</td>
          </tr>
          <tr class="total-row">
            <td>VALOR TOTAL DE PROPUESTA:</td>
            <td style="text-align: right;">${formatCurrency(quote.total)}</td>
          </tr>
        </table>

        <div class="conditions">
          <div class="conditions-box">
            <strong>OBSERVACIONES ESPECIALES</strong>
            <pre style="white-space: pre-wrap; margin-top: 5px; font-family: inherit; font-size: 10px; color: #4b5563;">${quote.observations || DEFAULT_QUOTE_OBSERVATIONS}</pre>
          </div>
          <div class="conditions-box">
            <strong>CONDICIONES COMERCIALES</strong>
            <pre style="white-space: pre-wrap; margin-top: 5px; font-family: inherit; font-size: 10px; color: #4b5563;">${DEFAULT_COMMERCIAL_CONDITIONS}</pre>
          </div>
        </div>

        <div class="footer">
          <p style="font-weight: bold; color: #4b5563; margin-bottom: 5px;">INFORMACIÓN DE PAGO: ${SITEC_BANK_INFO}</p>
          <p>SITEC SOLUCIONES TECNOLOGICAS INTEGRALES S.A.S. - Transformando su seguridad con tecnología de punta.</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const shareWhatsApp = (message: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
