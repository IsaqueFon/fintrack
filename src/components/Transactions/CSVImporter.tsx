import React, { useRef, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Transaction } from '../../utils/mockData';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export const CSVImporter: React.FC = () => {
  const { importTransactions } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // Função para baixar o modelo de CSV exemplo
  const downloadTemplate = () => {
    const csvContent = 
      'descricao,valor,categoria,data,tipo\n' +
      'Mercado Mensal,450.90,Alimentação,2026-07-02,despesa\n' +
      'Salário Extra,800.00,Freelance,2026-07-02,receita\n' +
      'Uber Faculdade,22.40,Transporte,2026-07-01,despesa\n' +
      'Curso de React,99.90,Educação,2026-06-30,despesa\n' +
      'Dividendos Ações,55.40,Investimentos,2026-06-28,receita';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_fintrack.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatus({
      type: 'success',
      message: 'Modelo de CSV baixado com sucesso!'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.name.endsWith('.csv')) {
      setStatus({
        type: 'error',
        message: 'Por favor, selecione apenas arquivos com extensão .csv'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error('O arquivo está vazio.');
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length <= 1) {
          throw new Error('O arquivo deve conter o cabeçalho e pelo menos uma linha de dados.');
        }

        // Ler cabeçalho
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const descIndex = headers.indexOf('descricao');
        const amountIndex = headers.indexOf('valor');
        const catIndex = headers.indexOf('categoria');
        const dateIndex = headers.indexOf('data');
        const typeIndex = headers.indexOf('tipo');

        if (descIndex === -1 || amountIndex === -1 || catIndex === -1 || dateIndex === -1 || typeIndex === -1) {
          throw new Error('Cabeçalhos inválidos. O CSV deve conter: descricao, valor, categoria, data, tipo.');
        }

        const parsedTransactions: Transaction[] = [];

        // Parsear cada linha
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',').map(c => c.trim());
          
          // Ignorar linhas incompletas
          if (columns.length < 5) continue;

          const description = columns[descIndex];
          const amount = parseFloat(columns[amountIndex]);
          const category = columns[catIndex];
          const date = columns[dateIndex];
          const typeRaw = columns[typeIndex].toLowerCase();

          // Validações
          if (!description || isNaN(amount) || !category || !date || (typeRaw !== 'receita' && typeRaw !== 'despesa')) {
            throw new Error(`Dados inválidos ou mal formatados na linha ${i + 1}.`);
          }

          const tx: Transaction = {
            id: `tx-csv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            description,
            amount,
            category,
            date,
            type: typeRaw as 'receita' | 'despesa'
          };
          
          parsedTransactions.push(tx);
        }

        if (parsedTransactions.length === 0) {
          throw new Error('Nenhuma transação válida foi encontrada no CSV.');
        }

        // Importar para o estado global
        importTransactions(parsedTransactions);
        setStatus({
          type: 'success',
          message: `${parsedTransactions.length} transações importadas com sucesso do arquivo CSV!`
        });

        // Limpar o input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err: any) {
        setStatus({
          type: 'error',
          message: err.message || 'Erro ao processar o arquivo CSV.'
        });
      }
    };

    reader.onerror = () => {
      setStatus({
        type: 'error',
        message: 'Erro de leitura do arquivo.'
      });
    };

    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Importador CSV de Transações</h3>
          <p className="text-xs text-slate-500">Adicione múltiplas transações de uma só vez via planilha</p>
        </div>
      </div>

      {/* Drag & Drop Simulation */}
      <div className="mt-5">
        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-600 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="mb-2 h-7 w-7 text-slate-400" />
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-violet-400">Clique para fazer upload</span> ou arraste o arquivo CSV
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Apenas arquivos .csv padrão UTF-8</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Messages */}
      {status.type !== 'idle' && (
        <div
          className={`mt-4 flex items-start gap-2.5 rounded-xl p-3 border text-xs leading-relaxed ${
            status.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Template Download Option */}
      <div className="mt-5 border-t border-slate-900 pt-4 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">Precisa de ajuda? Baixe o modelo formatado.</span>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-700 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Baixar Modelo CSV Exemplo
        </button>
      </div>
    </div>
  );
};
