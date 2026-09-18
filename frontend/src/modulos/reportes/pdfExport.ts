import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Maquina, Tecnico, Asignacion, Mantenimiento, ContratoMantenimiento, Bitacora } from '../../../../shared/types';

export type ReportType = 'inventario' | 'asignaciones' | 'mantenimientos' | 'contratos' | 'bitacora' | 'resumen_ejecutivo';

interface ExportPdfOptions {
  reportType: ReportType;
  maquinas: Maquina[];
  tecnicos: Tecnico[];
  asignaciones: Asignacion[];
  mantenimientos: Mantenimiento[];
  contratos: ContratoMantenimiento[];
  bitacora: Bitacora[];
  usuarioNombre?: string;
}

export function exportReportToPDF({
  reportType,
  maquinas = [],
  tecnicos = [],
  asignaciones = [],
  mantenimientos = [],
  contratos = [],
  bitacora = [],
  usuarioNombre = 'Administrador'
}: ExportPdfOptions) {
  const isLandscape = reportType === 'inventario' || reportType === 'asignaciones' || reportType === 'contratos' || reportType === 'bitacora';
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const secondaryColor = [217, 119, 6]; // Amber 600
  const textMuted = [100, 116, 139]; // Slate 500
  const bgLight = [248, 250, 252]; // Slate 50

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 26, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PRODIMA GUATEMALA - PRODUCTOS INDUSTRIALES Y MAQUINARIA', 14, 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text('19 Calle 5-87 Zona 11 Col. Mariscal, PBX: 2472-7019 | prodimagt.com | Certificación ISO 9001:2015', 14, 16);

  doc.setFontSize(7.5);
  doc.setTextColor(251, 191, 36);
  doc.text('DISTRIBUCIÓN OFICIAL & SERVICIO TÉCNICO: ESAB | MILLER | LINCOLN | VICTOR | KISWEL', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(254, 243, 199);
  doc.setFont('helvetica', 'bold');
  doc.text(`EMISIÓN: ${formattedDate} ${formattedTime}`, pageWidth - 14, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`RESPONSABLE: ${usuarioNombre}`, pageWidth - 14, 16, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text(`SISTEMA ERP PRODIMA V2.6`, pageWidth - 14, 22, { align: 'right' });

  let reportTitle = '';
  let reportSubtitle = '';

  switch (reportType) {
    case 'inventario':
      reportTitle = 'INFORME DE INVENTARIO Y FICHA TÉCNICA DE MÁQUINAS DE SOLDAR';
      reportSubtitle = `Total de equipos registrados: ${maquinas.length} unidades en planta y proyectos`;
      break;
    case 'asignaciones':
      reportTitle = 'CONTROL DE ASIGNACIONES Y CUSTODIA DE EQUIPOS POR TÉCNICO';
      reportSubtitle = `Historial y estado de ${asignaciones.length} asignaciones operativas`;
      break;
    case 'mantenimientos':
      reportTitle = 'PROGRAMA DE MANTENIMIENTO PREVENTIVO Y REPARACIONES CORRECTIVAS';
      reportSubtitle = `Registro de ${mantenimientos.length} servicios de calibración y soporte técnico`;
      break;
    case 'contratos':
      reportTitle = 'ESTADO DE CONTRATOS DE MANTENIMIENTO Y GARANTÍAS CON PROVEEDORES';
      reportSubtitle = `Auditoría legal y financiera de ${contratos.length} pólizas y contratos de servicio`;
      break;
    case 'bitacora':
      reportTitle = 'BITÁCORA OFICIAL DE AUDITORÍA Y TRAZABILIDAD DEL SISTEMA';
      reportSubtitle = `Registro cronológico inalterable de auditoría (${bitacora.length} eventos)`;
      break;
    case 'resumen_ejecutivo':
      reportTitle = 'DOSSIER INDUSTRIAL EJECUTIVO: PARQUE DE SOLDADURA Y OPERACIONES';
      reportSubtitle = 'Consolidado general de inventario, mantenimientos, asignaciones y costos';
      break;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle, 14, 34);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(reportSubtitle, 14, 39);

  let currentY = 44;

  if (reportType === 'inventario') {
    const disponibles = maquinas.filter(m => m.estado === 'Disponible').length;
    const asignadas = maquinas.filter(m => m.estado === 'Asignada').length;
    const enMant = maquinas.filter(m => m.estado === 'En mantenimiento' || m.estado === 'Reparación').length;
    const fueraServicio = maquinas.filter(m => m.estado === 'Fuera de servicio' || m.estado === 'Baja').length;

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`RESUMEN OPERATIVO:  Total: ${maquinas.length}  |  Disponibles: ${disponibles}  |  Asignadas: ${asignadas}  |  En Mantenimiento: ${enMant}  |  Fuera de Servicio: ${fueraServicio}`, 18, currentY + 7.5);

    currentY += 16;

    const tableData = maquinas.map(m => [
      m.codigo_interno || 'S/C',
      `${m.marca} ${m.modelo}`,
      m.numero_serie || 'N/D',
      m.tipo,
      `${m.voltaje} / ${m.amperaje}`,
      m.ubicacion,
      m.estado
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Código', 'Marca / Modelo', 'N° Serie', 'Proceso / Tipo', 'Especificación', 'Ubicación', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [180, 83, 9] }, // Amber code
        6: { fontStyle: 'bold' }
      }
    });

  } else if (reportType === 'asignaciones') {
    const activas = asignaciones.filter(a => a.estado === 'Activa').length;
    const finalizadas = asignaciones.filter(a => a.estado === 'Finalizada').length;

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`ESTADO DE ASIGNACIONES:  Total Registros: ${asignaciones.length}  |  En Uso Activo: ${activas}  |  Equipos Devueltos: ${finalizadas}`, 18, currentY + 7.5);

    currentY += 16;

    const tableData = asignaciones.map(a => [
      `#${a.id}`,
      a.maquina_codigo || `ID ${a.maquina_id}`,
      a.tecnico_nombre || `Técnico #${a.tecnico_id}`,
      a.motivo || 'Uso general en proyectos',
      a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleDateString() : 'N/D',
      a.fecha_devolucion ? new Date(a.fecha_devolucion).toLocaleDateString() : 'En uso',
      a.estado
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Máquina', 'Técnico Responsable', 'Motivo del Trabajo', 'F. Asignación', 'F. Devolución', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        1: { fontStyle: 'bold', textColor: [180, 83, 9] },
        6: { fontStyle: 'bold' }
      }
    });

  } else if (reportType === 'mantenimientos') {
    const totalCosto = mantenimientos.reduce((acc, m) => acc + (m.costo || 0), 0);
    const preventivos = mantenimientos.filter(m => m.tipo === 'Preventivo').length;
    const correctivos = mantenimientos.filter(m => m.tipo === 'Correctivo').length;

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`GASTO EN MANTENIMIENTO:  Total Invertido: Q${totalCosto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}  |  Preventivos: ${preventivos}  |  Correctivos: ${correctivos}`, 18, currentY + 7.5);

    currentY += 16;

    const tableData = mantenimientos.map(m => [
      `#${m.id}`,
      m.maquina_codigo || `ID ${m.maquina_id}`,
      m.tipo,
      m.descripcion || 'Mantenimiento estándar',
      m.proveedor || m.tecnico_responsable || 'Taller Interno',
      m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString() : 'N/D',
      `Q${(m.costo || 0).toFixed(2)}`,
      m.estado
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Máquina', 'Tipo', 'Descripción del Trabajo', 'Proveedor / Responsable', 'Fecha', 'Costo (GTQ)', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        1: { fontStyle: 'bold', textColor: [180, 83, 9] },
        6: { fontStyle: 'bold', textColor: [5, 150, 105], halign: 'right' },
        7: { fontStyle: 'bold' }
      }
    });

  } else if (reportType === 'contratos') {
    const costoTotalContratos = contratos.reduce((acc, c) => acc + (c.costo || 0), 0);
    const vigentes = contratos.filter(c => c.estado === 'Vigente').length;

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`RESUMEN PÓLIZAS:  Total Contratos: ${contratos.length}  |  Vigentes: ${vigentes}  |  Inversión Anual: Q${costoTotalContratos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 18, currentY + 7.5);

    currentY += 16;

    const tableData = contratos.map(c => [
      c.numero_contrato,
      c.maquina_codigo || `ID ${c.maquina_id}`,
      c.proveedor,
      `${c.fecha_inicio} al ${c.fecha_fin}`,
      c.tipo_servicio || 'Servicio Integral',
      `Q${(c.costo || 0).toFixed(2)}`,
      c.estado
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['N° Contrato', 'Máquina', 'Proveedor Especializado', 'Vigencia', 'Cobertura / Servicio', 'Costo (GTQ)', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold', textColor: [180, 83, 9] },
        5: { fontStyle: 'bold', textColor: [5, 150, 105], halign: 'right' },
        6: { fontStyle: 'bold' }
      }
    });

  } else if (reportType === 'bitacora') {
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`TRAZABILIDAD DE SEGURIDAD: Mostrando los últimos registros de eventos del sistema para fines de auditoría`, 18, currentY + 7.5);

    currentY += 16;

    const tableData = bitacora.slice(0, 100).map(b => [
      `#${b.id}`,
      b.fecha_hora ? new Date(b.fecha_hora).toLocaleString() : (b.fecha || 'N/D'),
      b.usuario_nombre,
      b.modulo,
      b.accion,
      b.detalles || b.descripcion || 'Evento auditado',
      b.ip_address || b.direccion_ip || '127.0.0.1'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Fecha / Hora', 'Usuario', 'Módulo', 'Acción', 'Detalle de la Operación', 'IP Origen']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        4: { fontStyle: 'bold' },
        6: { fontStyle: 'normal', textColor: [100, 116, 139] }
      }
    });

  } else if (reportType === 'resumen_ejecutivo') {
    const totalMaquinas = maquinas.length;
    const disponibles = maquinas.filter(m => m.estado === 'Disponible').length;
    const asignadas = maquinas.filter(m => m.estado === 'Asignada').length;
    const enMant = maquinas.filter(m => m.estado === 'En mantenimiento' || m.estado === 'Reparación').length;
    const totalCostoMant = mantenimientos.reduce((acc, m) => acc + (m.costo || 0), 0);
    const totalContratos = contratos.reduce((acc, c) => acc + (c.costo || 0), 0);

    const cardWidth = (pageWidth - 28 - 8) / 3;
    
    doc.setFillColor(239, 246, 255); // Blue 50
    doc.roundedRect(14, currentY, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('PARQUE DE MAQUINARIA', 18, currentY + 6);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalMaquinas} Equipos`, 18, currentY + 14);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${disponibles} Libres | ${asignadas} En Uso | ${enMant} Mant.`, 18, currentY + 19);

    doc.setFillColor(254, 243, 199); // Amber 50
    doc.roundedRect(14 + cardWidth + 4, currentY, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL HOMOLOGADO', 18 + cardWidth + 4, currentY + 6);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${tecnicos.length} Técnicos`, 18 + cardWidth + 4, currentY + 14);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${asignadas} Máquinas actualmente bajo custodia`, 18 + cardWidth + 4, currentY + 19);

    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.roundedRect(14 + (cardWidth * 2) + 8, currentY, cardWidth, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70);
    doc.setFont('helvetica', 'bold');
    doc.text('INVERSIÓN TÉCNICA TOTAL', 18 + (cardWidth * 2) + 8, currentY + 6);
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`Q${(totalCostoMant + totalContratos).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 18 + (cardWidth * 2) + 8, currentY + 14);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Mantenimientos + Pólizas de soporte`, 18 + (cardWidth * 2) + 8, currentY + 19);

    currentY += 28;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Distribución y Estado del Parque de Máquinas de Soldar', 14, currentY);

    const maquinasData = maquinas.slice(0, 15).map(m => [
      m.codigo_interno || 'S/C',
      `${m.marca} ${m.modelo}`,
      m.tipo,
      m.amperaje,
      m.ubicacion,
      m.estado
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Código', 'Equipo', 'Proceso', 'Amperaje', 'Ubicación', 'Estado']],
      body: maquinasData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 }
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : currentY + 50;

    if (finalY < pageHeight - 60) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Últimas Intervenciones de Mantenimiento Registradas', 14, finalY);

      const mantData = mantenimientos.slice(0, 8).map(m => [
        m.maquina_codigo || `ID ${m.maquina_id}`,
        m.tipo,
        m.descripcion,
        m.proveedor || m.tecnico_responsable,
        `Q${(m.costo || 0).toFixed(2)}`,
        m.estado
      ]);

      autoTable(doc, {
        startY: finalY + 3,
        head: [['Máquina', 'Tipo', 'Descripción', 'Responsable', 'Costo', 'Estado']],
        body: mantData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2 }
      });
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PRODIMA Guatemala ERP | Documento Oficial de Gestión, Mantenimiento y Auditoría ISO 9001:2015 | prodimagt.com', 14, pageHeight - 12);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 12, { align: 'right' });
  }

  const filename = `Reporte_${reportType.toUpperCase()}_${formattedDate.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}
