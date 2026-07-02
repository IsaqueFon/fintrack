import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EXPENSE_CATEGORIES } from '../../utils/mockData';
import { formatCurrency } from '../../utils/format';
import { ShieldAlert, PiggyBank, Settings, Save, AlertTriangle } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const { transactions, budgets, updateBudget } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || isNaN(parseFloat(limit)) || parseFloat(limit) <= 0) return;

    updateBudget(selectedCategory, parseFloat(limit));
    setStatusMsg(`Orçamento de ${selectedCategory} atualizado para ${formatCurrency(parseFloat(limit))}!`);
    setLimit('');

    setTimeout(() => {
      setStatusMsg('');
    }, 3000);
  };

  // Obter detalhes de gastos para cada orçamento definido
  const budgetDetails = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'despesa' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const ratio = spent / b.limit;
    const remaining = b.limit - spent;

    return {
      ...b,
      spent,
      ratio: ratio * 100,
      remaining
    };
  });

  return (
    <div className="space-y-6">
      {/* Grid: Form on Left, List on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Card */}
        <div className="glass-panel rounded-2xl p-6 h-fit">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-violet-400" />
            Configurar Limites
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-violet-500 focus:outline-none cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Limite Mensal (R$)
              </label>
              <input
                type="number"
                step="10"
                placeholder="Ex: 500"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:border-violet-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              <Save className="h-4 w-4" />
              Salvar Orçamento
            </button>
          </form>

          {statusMsg && (
            <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-center text-xs text-violet-400">
              {statusMsg}
            </div>
          )}
        </div>

        {/* Budgets List with Progress Bars */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Acompanhamento de Gastos</h3>
            <p className="text-xs text-slate-500">Veja o consumo dos seus limites mensais estabelecidos</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {budgetDetails.map(budget => {
              const isOver = budget.ratio >= 100;
              const isWarning = budget.ratio >= 80 && budget.ratio < 100;

              return (
                <div
                  key={budget.category}
                  className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-250 text-sm">{budget.category}</span>
                      <span className="ml-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Limite: {formatCurrency(budget.limit)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400">Gasto: </span>
                      <span className={`text-sm font-bold ${isOver ? 'text-rose-500' : 'text-slate-200'}`}>
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                          : isWarning
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, budget.ratio)}%` }}
                    />
                  </div>

                  {/* Extra info & Indicators */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {isOver ? (
                        <span className="flex items-center gap-1 font-bold text-rose-500 text-[11px]">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Estourado em {formatCurrency(Math.abs(budget.remaining))}
                        </span>
                      ) : isWarning ? (
                        <span className="flex items-center gap-1 font-semibold text-amber-500 text-[11px]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Próximo ao limite
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
                          Disponível: {formatCurrency(budget.remaining)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-455 bg-slate-900 px-2 py-0.5 rounded">
                      {budget.ratio.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
