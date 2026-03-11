import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUp, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { extractTextFromPDF, parseBudgetData } from '@/utils/pdf-parser';
import { showError, showSuccess } from '@/utils/toast';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils-format';

interface PDFImportDialogProps {
  onImport: (data: any) => void;
}

const PDFImportDialog = ({ onImport }: PDFImportDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

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
      setPreviewData(data);
      showSuccess('PDF analisado com sucesso!');
    } catch (error) {
      console.error(error);
      showError('Erro ao processar o PDF. Verifique o formato do arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = () => {
    if (previewData) {
      onImport(previewData);
      setIsOpen(false);
      setPreviewData(null);
      showSuccess('Dados importados para o formulário!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setPreviewData(null);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <FileUp className="mr-2" size={18} /> Importar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Dados de PDF</DialogTitle>
        </DialogHeader>
        
        {!previewData ? (
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
                  <p className="text-xs text-slate-500">Extrairemos cliente, placa, KM e itens</p>
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
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
              <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} /> Dados Encontrados:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border">
                  <p className="text-slate-400 font-bold uppercase">Cliente</p>
                  <p className="font-bold truncate">{previewData.clientName || 'Não encontrado'}</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="text-slate-400 font-bold uppercase">Placa</p>
                  <p className="font-bold">{previewData.vehiclePlate || 'Não encontrada'}</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="text-slate-400 font-bold uppercase">KM</p>
                  <p className="font-bold">{previewData.km ? `${previewData.km} KM` : 'Não encontrado'}</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="text-slate-400 font-bold uppercase">Itens</p>
                  <p className="font-bold">{previewData.items.length} detectados</p>
                </div>
              </div>
            </div>

            {previewData.items.length > 0 && (
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Prévia dos Itens:</p>
                {previewData.items.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[10px] p-1 bg-slate-50 rounded">
                    <span className="truncate flex-1 mr-2">{item.description}</span>
                    <span className="font-bold">{formatCurrency(item.unitValue)}</span>
                  </div>
                ))}
                {previewData.items.length > 5 && (
                  <p className="text-[10px] text-center text-slate-400">... e mais {previewData.items.length - 5} itens</p>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p>Confira os dados antes de confirmar. Você poderá editar qualquer campo no formulário após a importação.</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => { setPreviewData(null); setIsOpen(false); }}>Cancelar</Button>
          {previewData && (
            <Button onClick={confirmImport} className="bg-blue-600">Confirmar Importação</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFImportDialog;