import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/mockData';
import type { Transaction } from '../../utils/mockData';
import { formatCurrency, formatDate } from '../../utils/format';
import { CSVImporter } from './CSVImporter';
import {
  Trash2,
  Edit2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useFinance();

  // Estados de Filtros e Busca
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Estados do Formulário / CRUD
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toggle do Importador CSV
  const [showImporter, setShowImporter] = useState(false);

  // Manipular Categoria quando muda o tipo
  const handleTypeChange = (newType: 'receita' | 'despesa') => {
    setType(newType);
    setCategory(newType === 'receita' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  // Enviar Formulário (Adicionar / Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || isNaN(parseFloat(amount))) return;

    const txData = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date
    };

    if (isEditing) {
      updateTransaction(isEditing, txData);
      setIsEditing(null);
    } else {
      addTransaction(txData);
    }

    // Resetar campos
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('despesa');
    setCategory(EXPENSE_CATEGORIES[0]);
  };

  // Iniciar Edição
  const startEdit = (tx: Transaction) => {
    setIsEditing(tx.id);
    setDescription(tx.description);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setCategory(tx.category);
    setDate(tx.date);
  };

  // Cancelar Edição
  const cancelEdit = () => {
    setIsEditing(null);
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('despesa');
    setCategory(EXPENSE_CATEGORIES[0]);
  };

  // Aplicar Filtros e Ordenação
  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'todos' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'todas' || tx.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else {
        comparison = a.amount - b.amount;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Cálculo de Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Lista de todas as categorias para o filtro
  const allCategoriesForFilter = ['todas', ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="space-y-6">
      {/* Action Bar (Search, Filters, Importer toggle) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 md:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-300 focus:border-violet-500 focus:outline-none cursor-pointer max-w-[160px]"
          >
            <option value="todas">Todas Categorias</option>
            {allCategoriesForFilter
              .filter(cat => cat !== 'todas')
              .map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))
            }
          </select>
        </div>

        {/* CSV Import Toggle Button */}
        <button
          onClick={() => setShowImporter(!showImporter)}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
            showImporter
              ? 'border-violet-500 bg-violet-600/10 text-violet-400'
              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="h-4.5 w-4.5" />
          {showImporter ? 'Fechar Importador' : 'Importar CSV'}
        </button>
      </div>

      {/* CSV Importer Section */}
      {showImporter && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CSVImporter />
        </div>
      )}

      {/* Main Grid: Form on Left, List on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Card */}
        <div className="glass-panel rounded-2xl p-6 h-fit">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit2 className="h-5 w-5 text-violet-400" />
                Editar Transação
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 text-violet-400" />
                Nova Transação
              </>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('receita')}
                className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                  type === 'receita'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('despesa')}
                className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                  type === 'despesa'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-400 font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                }`}
              >
                Despesa
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: Almoço, Salário Freelance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:border-violet-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:border-violet-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                {type === 'receita'
                  ? INCOME_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  : EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                }
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-355 focus:border-violet-500 focus:outline-none text-slate-300"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex gap-2 pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
              >
                {isEditing ? 'Salvar Alterações' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>

        {/* Transactions Table Card */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between min-h-[480px]">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Lista de Transações</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                {filteredTransactions.length} registros
              </span>
            </h3>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/40">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4">Descrição</th>
                    <th className="p-4 cursor-pointer hover:text-slate-300" onClick={() => toggleSort('date')}>
                      <div className="flex items-center gap-1">
                        Data
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4 cursor-pointer hover:text-slate-300" onClick={() => toggleSort('amount')}>
                      <div className="flex items-center gap-1">
                        Valor
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="p-4 font-semibold text-slate-200">{tx.description}</td>
                        <td className="p-4 text-slate-400">{formatDate(tx.date)}</td>
                        <td className="p-4">
                          <span className="rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-400 border border-slate-800/30">
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-bold ${
                              tx.type === 'receita' ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(tx)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-900 hover:text-violet-400 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-900 hover:text-rose-455 transition-colors text-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Nenhuma transação cadastrada ou correspondente aos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-medium text-slate-400">
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-1.5 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-1.5 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
