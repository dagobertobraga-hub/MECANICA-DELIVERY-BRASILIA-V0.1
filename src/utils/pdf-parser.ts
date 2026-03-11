import * as pdfjsLib from 'pdfjs-dist';

// Configuração do worker para o Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const parseBudgetData = (text: string) => {
  // Tentativa simples de extrair dados usando Regex baseado no padrão do app
  const clientMatch = text.match(/CLIENTE:\s*([^]+?)(?=VEÍCULO|ORÇAMENTO|$)/i);
  const plateMatch = text.match(/PLACA\):\s*([A-Z0-9]{7})/i);
  const kmMatch = text.match(/KM ATUAL:\s*(\d+)/i);
  
  // Busca por padrões de valores monetários e descrições (ex: "PEÇA 1 100,00")
  // Esta é uma implementação básica que pode precisar de ajustes dependendo do PDF
  const items: any[] = [];
  const lines = text.split('\n');
  
  return {
    clientName: clientMatch ? clientMatch[1].trim() : '',
    vehiclePlate: plateMatch ? plateMatch[1].trim() : '',
    km: kmMatch ? parseInt(kmMatch[1]) : 0,
    extractedText: text // Retornamos o texto completo para conferência
  };
};