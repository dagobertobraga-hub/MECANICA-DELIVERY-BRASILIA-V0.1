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
    // Unir itens da mesma linha para manter o contexto
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const parseBudgetData = (text: string) => {
  // Normalizar o texto para facilitar a busca
  const normalizedText = text.toUpperCase();

  // Regex mais flexíveis para Cliente, Placa e KM
  const clientMatch = text.match(/(?:CLIENTE|NOME|PROPRIETÁRIO)[:\s]+([A-ZÀ-Ú\s]{3,50})/i);
  const plateMatch = text.match(/(?:PLACA|VEÍCULO)[:\s\(\)]+([A-Z]{3}[0-9][A-Z0-9][0-9]{2})/i);
  const kmMatch = text.match(/(?:KM|QUILOMETRAGEM|ODÔMETRO)[:\s]+(\d+)/i);

  // Lógica para extrair itens (Peças e Serviços)
  // Procuramos por linhas que contenham valores monetários (R$ 0,00 ou 0.00)
  const items: any[] = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    // Procura por padrões de preço: R$ 100,00 ou apenas 100,00 no final da linha
    const priceMatch = line.match(/(?:R\$?\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/g);
    
    if (priceMatch && priceMatch.length >= 1) {
      // Tenta pegar a descrição (texto no início da linha antes dos números)
      const descMatch = line.match(/^([A-ZÀ-Ú0-9\s\-\/]{5,})/i);
      if (descMatch) {
        const description = descMatch[1].trim();
        // Evita pegar linhas de cabeçalho ou totais
        if (!description.includes('TOTAL') && !description.includes('SUBTOTAL') && !description.includes('CNPJ')) {
          const valueStr = priceMatch[priceMatch.length - 1].replace('R$', '').replace('.', '').replace(',', '.').trim();
          const value = parseFloat(valueStr);

          if (!isNaN(value) && value > 0) {
            items.push({
              id: Math.random().toString(36).substr(2, 9),
              description: description.toUpperCase(),
              quantity: 1, // Valor padrão, pode ser ajustado manualmente
              unitValue: value,
              type: (line.toUpperCase().includes('SERVIÇO') || line.toUpperCase().includes('MÃO DE OBRA')) ? 'Serviço' : 'Peça'
            });
          }
        }
      }
    }
  });

  return {
    clientName: clientMatch ? clientMatch[1].trim().toUpperCase() : '',
    vehiclePlate: plateMatch ? plateMatch[1].trim().toUpperCase() : '',
    km: kmMatch ? parseInt(kmMatch[1]) : 0,
    items: items,
    extractedText: text
  };
};