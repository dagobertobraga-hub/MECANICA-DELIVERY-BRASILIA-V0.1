import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget } from './types';
import { formatCurrency } from './utils-format';

export const generateBudgetPDF = (budget: Budget) => {
  const doc = new jsPDF();
  const storeInfo = {
    name: 'MECÂNICA DELIVERY BRASÍLIA',
    cnpj: '48.679.251.0001/70',
    address: 'SDE QUADRA 02 CONJUNTO A LOTE 06 CEP 72145201',
    phone: '(61) 99138-6470',
    email: 'Dagoberto.braga@gmail.com',
    provider: 'DAGOBERTO CARDOSO BRAGA'
  };

  // Header
  doc.setFontSize(18);
  doc.text(storeInfo.name, 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`CNPJ: ${storeInfo.cnpj}`, 105, 22, { align: 'center' });
  doc.text(storeInfo.address, 105, 27, { align: 'center' });
  doc.text(`Tel: ${storeInfo.phone} | Email: ${storeInfo.email}`, 105, 32, { align: 'center' });
  
  doc.line(10, 38, 200, 38);

  // Budget Info
  doc.setFontSize(12);
  doc.text(`ORÇAMENTO Nº: ${budget.number}`, 10, 48);
  doc.text(`CLIENTE: ${budget.clientName.toUpperCase()}`, 10, 55);
  doc.text(`VEÍCULO (PLACA): ${budget.vehiclePlate.toUpperCase()}`, 10, 62);
  doc.text(`KM ATUAL: ${budget.km}`, 140, 62);
  doc.text(`PRESTADOR: ${storeInfo.provider}`, 10, 69);
  doc.text(`DATA: ${new Date(budget.date).toLocaleDateString('pt-BR')}`, 140, 48);

  const parts = budget.items.filter(i => i.type === 'Peça');
  const services = budget.items.filter(i => i.type === 'Serviço');

  let currentY = 75;

  if (parts.length > 0) {
    doc.text('PEÇAS', 10, currentY + 5);
    autoTable(doc, {
      startY: currentY + 8,
      head: [['Descrição', 'Qtd', 'Vlr. Unit', 'Subtotal']],
      body: parts.map(p => [
        p.description.toUpperCase(),
        p.quantity,
        formatCurrency(p.unitValue),
        formatCurrency(p.quantity * p.unitValue)
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 15 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  if (services.length > 0) {
    doc.text('SERVIÇOS', 10, currentY + 5);
    autoTable(doc, {
      startY: currentY + 8,
      head: [['Descrição', 'Qtd', 'Vlr. Unit', 'Subtotal']],
      body: services.map(s => [
        s.description.toUpperCase(),
        s.quantity,
        formatCurrency(s.unitValue),
        formatCurrency(s.quantity * s.unitValue)
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 15 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  const totalParts = parts.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
  const totalServices = services.reduce((acc, i) => acc + (i.quantity * i.unitValue), 0);
  const total = totalParts + totalServices;

  doc.setFontSize(12);
  doc.text(`TOTAL PEÇAS: ${formatCurrency(totalParts)}`, 140, currentY);
  doc.text(`TOTAL SERVIÇOS: ${formatCurrency(totalServices)}`, 140, currentY + 7);
  doc.setFontSize(14);
  doc.text(`TOTAL GERAL: ${formatCurrency(total)}`, 140, currentY + 15);

  return doc;
};