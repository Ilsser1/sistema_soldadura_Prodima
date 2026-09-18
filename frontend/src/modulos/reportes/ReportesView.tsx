import React, { useState } from 'react';
import { Maquina, Tecnico, Asignacion, Mantenimiento, ContratoMantenimiento, Bitacora, RolUsuario } from '../../../../shared/types';
import { exportReportToPDF, ReportType } from './pdfExport';
import {
  FileSpreadsheet,
  Filter,
  Cpu,
  HardHat,
  Wrench,
  FileText,
  ShieldCheck,
  Check,
  FileDown,
  Shield
} from 'lucide-react';

interface ReportesViewProps {
  maquinas: Maquina[];
  tecnicos: Tecnico[];
  asignaciones: Asignacion[];
  mantenimientos: Mantenimiento[];
  contratos: ContratoMantenimiento[];
  bitacora: Bitacora[];
  currentRole?: RolUsuario;
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  maquinas = [],
  tecnicos = [],
  asignaciones = [],
  mantenimientos = [],
  contratos = [],
  bitacora = [],
  currentRole = 'Administrador'
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventario');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  if (currentRole === 'Técnico') {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">Acceso Restringido</h3>
        <p className="text-xs mt-1 text-slate-400">
          La generación y exportación de reportes ejecutivos e inventarios está reservada para los roles <span className="text-amber-400 font-bold">Administrador</span> y <span className="text-amber-400 font-bold">Supervisor</span>.
        </p>
      </div>
    );
  }

  const handleExportPDF = (typeToExport: ReportType = selectedReport) => {
    try {
      setIsGeneratingPdf(true);
      exportReportToPDF({
        reportType: typeToExport,
        maquinas,
        tecnicos,
        asignaciones,
        mantenimientos,
        contratos,
        bitacora,
        usuarioNombre: localStorage.getItem('active_username') || 'Administrador'
      });
      setPdfSuccessMessage(`¡Reporte PDF (${typeToExport.toUpperCase()}) generado y descargado exitosamente!`);
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (error) {
      console.error('Error al exportar PDF con jsPDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const exportToCSV = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {pdfSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2 animate-fadeIn print:hidden">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 text-xs print:hidden">
        <button
          onClick={() => setSelectedReport('inventario')}
          className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
            selectedReport === 'inventario'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" /> Inventario Máquinas
        </button>

        <button
          onClick={() => setSelectedReport('asignaciones')}
          className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
            selectedReport === 'asignaciones'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <HardHat className="w-4 h-4" /> Asignaciones
        </button>

        <button
          onClick={() => setSelectedReport('mantenimientos')}
          className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
            selectedReport === 'mantenimientos'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" /> Mantenimientos
        </button>

        <button
          onClick={() => setSelectedReport('contratos')}
          className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
            selectedReport === 'contratos'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Contratos
        </button>

        <button
          onClick={() => setSelectedReport('bitacora')}
          className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
            selectedReport === 'bitacora'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Bitácora
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 print:hidden">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>Reporte activo: <strong className="text-amber-400 uppercase">{selectedReport}</strong></span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportPDF(selectedReport)}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            title="Exportar a PDF"
          >
            <FileDown className="w-4 h-4 text-red-400" />
            {isGeneratingPdf ? 'Generando PDF...' : 'Exportar PDF'}
          </button>
          <button
            onClick={() => {
              if (selectedReport === 'inventario') exportToCSV('reporte_maquinas_soldar', maquinas);
              if (selectedReport === 'asignaciones') exportToCSV('reporte_asignaciones_tecnicos', asignaciones);
              if (selectedReport === 'mantenimientos') exportToCSV('reporte_mantenimientos_equipos', mantenimientos);
              if (selectedReport === 'contratos') exportToCSV('reporte_contratos_mantenimiento', contratos);
              if (selectedReport === 'bitacora') exportToCSV('reporte_bitacora_auditoria', bitacora);
            }}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-slate-200 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none">
        
        <div className="border-b-2 border-amber-500 pb-4 mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-amber-400 print:text-slate-900 uppercase tracking-wide">
              SISTEMA INDUSTRIAL DE GESTIÓN DE SOLDADURA
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 font-bold mt-0.5">
              DOCUMENTO OFICIAL DE REPORTE Y AUDITORÍA DE OPERACIONES
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono">
            <div>Fecha Generación: {new Date().toLocaleDateString()}</div>
            <div>Hora: {new Date().toLocaleTimeString()}</div>
            <div className="text-amber-400 print:text-slate-900 font-bold mt-1">
              REPORTE: {selectedReport.toUpperCase()}
            </div>
          </div>
        </div>

        {selectedReport === 'inventario' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 print:text-black border-b border-slate-800 pb-2">
              Inventario General de Máquinas de Soldar ({maquinas.length} Equipos)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-300 font-bold text-slate-400 print:text-slate-800">
                  <th className="p-2">Código</th>
                  <th className="p-2">Marca / Modelo</th>
                  <th className="p-2">Serie</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Especificaciones</th>
                  <th className="p-2">Ubicación</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {maquinas.map(m => (
                  <tr key={m.id}>
                    <td className="p-2 font-mono font-bold text-amber-400 print:text-slate-900">{m.codigo_interno || `M-${m.id}`}</td>
                    <td className="p-2 font-semibold">{m.marca} {m.modelo}</td>
                    <td className="p-2 font-mono text-[11px]">{m.numero_serie}</td>
                    <td className="p-2">{m.tipo}</td>
                    <td className="p-2 text-[11px] text-slate-400 print:text-slate-600">{m.voltaje} | {m.amperaje}</td>
                    <td className="p-2">{m.ubicacion}</td>
                    <td className="p-2 font-bold">{m.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'asignaciones' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 print:text-black border-b border-slate-800 pb-2">
              Reporte de Asignaciones de Equipos a Técnicos ({asignaciones.length} Registros)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-300 font-bold text-slate-400 print:text-slate-800">
                  <th className="p-2">ID</th>
                  <th className="p-2">Máquina</th>
                  <th className="p-2">Técnico Responsable</th>
                  <th className="p-2">Motivo del Trabajo</th>
                  <th className="p-2">Fecha Asignación</th>
                  <th className="p-2">Fecha Devolución</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {asignaciones.map(a => (
                  <tr key={a.id}>
                    <td className="p-2 font-mono">#{a.id}</td>
                    <td className="p-2 font-mono font-bold text-amber-400 print:text-slate-900">{a.maquina_codigo}</td>
                    <td className="p-2 font-semibold">{a.tecnico_nombre}</td>
                    <td className="p-2 max-w-xs">{a.motivo}</td>
                    <td className="p-2">{new Date(a.fecha_asignacion).toLocaleString()}</td>
                    <td className="p-2">{a.fecha_devolucion ? new Date(a.fecha_devolucion).toLocaleString() : 'En uso'}</td>
                    <td className="p-2 font-bold">{a.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'mantenimientos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 print:text-black border-b border-slate-800 pb-2">
              Reporte de Mantenimientos Preventivos y Correctivos ({mantenimientos.length} Registros)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-300 font-bold text-slate-400 print:text-slate-800">
                  <th className="p-2">ID</th>
                  <th className="p-2">Máquina</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Descripción</th>
                  <th className="p-2">Proveedor / Responsable</th>
                  <th className="p-2">Costo (GTQ)</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {mantenimientos.map(m => (
                  <tr key={m.id}>
                    <td className="p-2 font-mono">#{m.id}</td>
                    <td className="p-2 font-mono font-bold text-amber-400 print:text-slate-900">{m.maquina_codigo}</td>
                    <td className="p-2 font-bold">{m.tipo}</td>
                    <td className="p-2 max-w-xs">{m.descripcion}</td>
                    <td className="p-2">{m.proveedor} ({m.tecnico_responsable})</td>
                    <td className="p-2 font-mono font-bold text-emerald-400 print:text-slate-900">Q{m.costo.toFixed(2)}</td>
                    <td className="p-2 font-bold">{m.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'contratos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 print:text-black border-b border-slate-800 pb-2">
              Reporte de Contratos de Mantenimiento ({contratos.length} Registros)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-300 font-bold text-slate-400 print:text-slate-800">
                  <th className="p-2">N° Contrato</th>
                  <th className="p-2">Máquina</th>
                  <th className="p-2">Proveedor</th>
                  <th className="p-2">Inicio / Vencimiento</th>
                  <th className="p-2">Servicio</th>
                  <th className="p-2">Costo (GTQ)</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {contratos.map(c => (
                  <tr key={c.id}>
                    <td className="p-2 font-mono font-bold">{c.numero_contrato}</td>
                    <td className="p-2 font-mono text-amber-400 print:text-slate-900 font-bold">{c.maquina_codigo}</td>
                    <td className="p-2 font-semibold">{c.proveedor}</td>
                    <td className="p-2">{c.fecha_inicio} a {c.fecha_fin}</td>
                    <td className="p-2 max-w-xs text-[11px]">{c.tipo_servicio}</td>
                    <td className="p-2 font-mono font-bold">Q{c.costo.toFixed(2)}</td>
                    <td className="p-2 font-bold">{c.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'bitacora' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 print:text-black border-b border-slate-800 pb-2">
              Bitácora de Auditoría del Sistema ({bitacora.length} Eventos)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 print:border-slate-300 font-bold text-slate-400 print:text-slate-800">
                  <th className="p-2">ID</th>
                  <th className="p-2">Fecha y Hora</th>
                  <th className="p-2">Usuario</th>
                  <th className="p-2">Módulo</th>
                  <th className="p-2">Acción</th>
                  <th className="p-2">Detalles</th>
                  <th className="p-2 font-mono">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {bitacora.slice(0, 50).map(b => (
                  <tr key={b.id}>
                    <td className="p-2 font-mono">#{b.id}</td>
                    <td className="p-2">{new Date(b.fecha_hora).toLocaleString()}</td>
                    <td className="p-2 font-semibold">{b.usuario_nombre}</td>
                    <td className="p-2">{b.modulo}</td>
                    <td className="p-2 font-bold">{b.accion}</td>
                    <td className="p-2 text-[11px]">{b.detalles}</td>
                    <td className="p-2 font-mono text-[10px]">{b.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-800 print:border-slate-400 grid grid-cols-2 gap-8 text-center text-xs text-slate-400 print:text-slate-700">
          <div>
            <div className="border-b border-slate-600 print:border-slate-800 w-48 mx-auto mb-2"></div>
            <p className="font-bold">Firma del Encargado de Mantenimiento</p>
            <p className="text-[10px]">Supervisión Industrial</p>
          </div>
          <div>
            <div className="border-b border-slate-600 print:border-slate-800 w-48 mx-auto mb-2"></div>
            <p className="font-bold">Firma del Administrador del Sistema</p>
            <p className="text-[10px]">Auditoría Interna</p>
          </div>
        </div>

      </div>

    </div>
  );
};
