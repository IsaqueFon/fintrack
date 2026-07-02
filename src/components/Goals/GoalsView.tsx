import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { Target, PlusCircle, Trash2, PiggyBank, Calendar, Plus, X } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, addGoalContribution, deleteGoal, totalBalance } = useFinance();

  // Estados do Formulário de Nova Meta
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  // Estados de Contribuição
  const [contributionGoalId, setContributionGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionError, setContributionError] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || isNaN(parseFloat(target)) || !deadline) return;

    addGoal({
      name,
      target: parseFloat(target),
      deadline
    });

    setName('');
    setTarget('');
    setDeadline('');
    setShowAddForm(false);
  };

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionGoalId || !contributionAmount || isNaN(parseFloat(contributionAmount))) return;

    const amount = parseFloat(contributionAmount);

    if (amount <= 0) {
      setContributionError('O valor do aporte deve ser maior que R$ 0,00.');
      return;
    }

    if (amount > totalBalance) {
      setContributionError('Saldo atual insuficiente para realizar este aporte.');
      return;
    }

    addGoalContribution(contributionGoalId, amount);
    setContributionGoalId(null);
    setContributionAmount('');
    setContributionError('');
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Minhas Metas de Poupança</h3>
          <p className="text-xs text-slate-500">Defina objetivos e acompanhe seu progresso de economia</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? 'Cancelar' : 'Nova Meta'}
        </button>
      </div>

      {/* Grid: Add Form vs Goals List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {showAddForm && (
          <div className="glass-panel rounded-2xl p-6 h-fit lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-violet-400" />
              Criar Objetivo
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carro, Viagem, Faculdade..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Meta de Economia (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Data Alvo
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
              >
                Salvar Objetivo
              </button>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className={`grid gap-6 ${showAddForm ? 'lg:col-span-2' : 'lg:col-span-3'} sm:grid-cols-1 md:grid-cols-2`}>
          {goals.map(goal => {
            const pct = (goal.current / goal.target) * 100;
            const isCompleted = goal.current >= goal.target;

            return (
              <div
                key={goal.id}
                className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-md"
              >
                <div className="space-y-4">
                  {/* Goal header info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{goal.name}</h4>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>Alvo: {formatDate(goal.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-900 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Pricing detail */}
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Acumulado</span>
                      <span className="font-bold text-white text-base">{formatCurrency(goal.current)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Meta</span>
                      <span className="font-bold text-slate-350 text-sm">{formatCurrency(goal.target)}</span>
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>{pct.toFixed(0)}% concluído</span>
                      {isCompleted && (
                        <span className="rounded bg-emerald-950 px-1 py-0.5 text-emerald-400 border border-emerald-800/50">
                          Concluído!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Make deposit button or form */}
                <div className="mt-6 border-t border-slate-900 pt-4">
                  {contributionGoalId === goal.id ? (
                    <form onSubmit={handleContributionSubmit} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="10"
                          placeholder="Valor do Aporte"
                          value={contributionAmount}
                          onChange={(e) => {
                            setContributionAmount(e.target.value);
                            setContributionError('');
                          }}
                          required
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setContributionGoalId(null);
                            setContributionError('');
                          }}
                          className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                      {contributionError && (
                        <p className="text-[10px] font-semibold text-rose-500">{contributionError}</p>
                      )}
                    </form>
                  ) : (
                    <button
                      onClick={() => setContributionGoalId(goal.id)}
                      disabled={isCompleted}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-700 transition-all disabled:opacity-40 disabled:hover:bg-slate-900/40 disabled:hover:text-slate-300"
                    >
                      <PiggyBank className="h-4.5 w-4.5 text-violet-400" />
                      Fazer Aporte da Conta
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
