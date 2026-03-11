import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import { extractTextFromPDF, parseBudgetData } from '@/utils/pdf-parser';
import { showError, showSuccess } from '@/utils/toast';

interface PDFImportDialogProps {
  onImport: (data: any) => void;
}

const PDFImportDialog = ({ onImport }: PDFImportDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setIsProcessing(true);
    try {
      const text = await extractTextFromPDF(file);
      const data = parseBudgetData(text);
      
      onImport(data);
      showSuccess('Dados extraídos do PDF com sucesso!');
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      showError('Erro ao processar o PDF. Verifique o formato do arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <FileUp className="mr-2" size={18} /> Importar PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Dados de PDF</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-slate-200 bg-slate-50 space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-sm font-medium text-slate-600">Analisando documento...</p>
            </>
          ) : (
            <>
              <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                <FileUp size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700">Selecione o Orçamento em PDF</p>
                <p className="text-xs text-slate-500">O sistema tentará preencher os campos automaticamente</p>
              </div>
              <Input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </>
          )}
        </div>
        <div className="text-[10px] text-slate-400 mt-2">
          * A precisão da extração depende da qualidade e do layout do PDF original.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFImportDialog;