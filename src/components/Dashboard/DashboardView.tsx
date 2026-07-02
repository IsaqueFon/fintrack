import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { transactions, totalBalance, totalIncome, totalExpenses, budgets } = useFinance();

  // Cores do gráfico de pizza
  const COLORS = {
    'Alimentação': '#6366f1', // Indigo
    'Transporte': '#3b82f6',  // Blue
    'Moradia': '#10b981',     // Emerald
    'Lazer': '#f59e0b',       // Amber
    'Saúde': '#ef4444',       // Red
    'Educação': '#ec4899',    // Pink
    'Investimentos': '#8b5cf6', // Violet
    'Outros': '#94a3b8'        // Slate
  };

  const DEFAULT_COLOR = '#64748b';

  // Agrupar dados por data para o gráfico de evolução financeira (últimas transações)
  const getEvolutionData = () => {
    const datesMap: { [key: string]: { date: string; receitas: number; despesas: number } } = {};
    
    // Pegar todas as transações e inicializar no mapa
    transactions.forEach(t => {
      if (!datesMap[t.date]) {
        datesMap[t.date] = { date: t.date, receitas: 0, despesas: 0 };
      }
      if (t.type === 'receita') {
        datesMap[t.date].receitas += t.amount;
      } else {
        datesMap[t.date].despesas += t.amount;
      }
    });

    // Ordenar e formatar para o gráfico
    return Object.values(datesMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => {
        // Formata YYYY-MM-DD para DD/MM
        const parts = item.date.split('-');
        const dateLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
        return {
          ...item,
          name: dateLabel
        };
      })
      .slice(-10); // Exibir as últimas 10 datas com transações para manter legível
  };

  // Agrupar dados de despesas por categoria
  const getCategoryData = () => {
    const categoryMap: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'despesa')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  };

  const evolutionData = getEvolutionData();
  const categoryData = getCategoryData();
  const recentTransactions = transactions.slice(0, 5);

  // Geração de insights dinâmicos baseados nas finanças reais do usuário
  const generateInsights = () => {
    const insights = [];
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    if (savingsRate > 20) {
      insights.push({
        id: 'ins-1',
        title: 'Excelente Taxa de Poupança!',
        desc: `Você economizou ${savingsRate.toFixed(1)}% das suas receitas este mês. Parabéns pela disciplina financeira.`,
        type: 'success'
      });
    } else if (savingsRate > 0 && savingsRate <= 10) {
      insights.push({
        id: 'ins-2',
        title: 'Margem de Poupança Baixa',
        desc: `Você economizou apenas ${savingsRate.toFixed(1)}% das suas receitas. Considere reduzir despesas supérfluas (Lazer ou Alimentação fora).`,
        type: 'warning'
      });
    } else if (savingsRate <= 0 && totalIncome > 0) {
      insights.push({
        id: 'ins-3',
        title: 'Orçamento no Vermelho!',
        desc: 'Suas despesas superaram suas receitas neste mês. Revise suas despesas fixas para restaurar o equilíbrio financeiro.',
        type: 'danger'
      });
    }

    // Verificar se alguma categoria está perto do limite do orçamento
    budgets.forEach(b => {
      const spent = transactions
        .filter(t => t.type === 'despesa' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const ratio = spent / b.limit;
      if (ratio >= 1.0) {
        insights.push({
          id: `ins-b-ex-${b.category}`,
          title: `Orçamento Estourado: ${b.category}`,
          desc: `Você ultrapassou o limite de ${formatCurrency(b.limit)} em ${b.category}. Total gasto: ${formatCurrency(spent)}.`,
          type: 'danger'
        });
      } else if (ratio >= 0.8) {
        insights.push({
          id: `ins-b-al-${b.category}`,
          title: `Alerta de Orçamento: ${b.category}`,
          desc: `Você utilizou ${(ratio * 100).toFixed(0)}% do orçamento de ${b.category}. Limite restante: ${formatCurrency(b.limit - spent)}.`,
          type: 'warning'
        });
      }
    });

    // Insight padrão caso não existam alertas
    if (insights.length === 0) {
      insights.push({
        id: 'ins-default',
        title: 'Tudo Sob Controle',
        desc: 'Continue registrando suas despesas diárias para manter suas projeções e orçamentos sempre atualizados.',
        type: 'info'
      });
    }

    return insights;
  };

  const activeInsights = generateInsights().slice(0, 3); // Limitar a 3 insights principais

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card: Saldo Atual */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-indigo-950/60 to-violet-950/40 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-600/10 blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-violet-300">Saldo Atual</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {formatCurrency(totalBalance)}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-violet-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Disponível para uso
            </p>
          </div>
        </div>

        {/* Card: Total de Receitas */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Receitas (Mensal)</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {formatCurrency(totalIncome)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Entradas ativas no período
            </p>
          </div>
        </div>

        {/* Card: Total de Despesas */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Despesas (Mensal)</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {formatCurrency(totalExpenses)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
              <TrendingDown className="h-3.5 w-3.5" />
              Saídas totais debitadas
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evolution Chart */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Evolução Financeira</h4>
              <p className="text-xs text-slate-500">Histórico recente de receitas vs. despesas por dia</p>
            </div>
          </div>
          <div className="h-80 w-full">
            {evolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    name="Receitas"
                    type="monotone"
                    dataKey="receitas"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReceitas)"
                  />
                  <Area
                    name="Despesas"
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDespesas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Sem dados de evolução disponíveis. Insira transações para renderizar.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <h4 className="font-bold text-white">Despesas por Categoria</h4>
          <p className="text-xs text-slate-500 mb-4">Percentual distribuído dos gastos</p>
          <div className="relative flex h-60 items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => {
                      const color = COLORS[entry.name as keyof typeof COLORS] || DEFAULT_COLOR;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Nenhuma despesa cadastrada.
              </div>
            )}
          </div>
          {/* Legend Custom list */}
          <div className="mt-4 max-h-32 overflow-y-auto space-y-1.5 pr-1">
            {categoryData.map((item) => {
              const color = COLORS[item.name as keyof typeof COLORS] || DEFAULT_COLOR;
              const totalVal = categoryData.reduce((sum, c) => sum + c.value, 0);
              const pct = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">{formatCurrency(item.value)}</span>
                    <span className="ml-1.5 text-[10px] font-semibold text-slate-500">({pct.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights and Recent Transactions Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Insights Panel */}
        <div className="glass-panel rounded-2xl p-6 md:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h4 className="font-bold text-white">Insights do FinCoach</h4>
          </div>
          <div className="space-y-4">
            {activeInsights.map((insight) => (
              <div
                key={insight.id}
                className={`flex gap-3 rounded-xl p-3.5 border ${
                  insight.type === 'success'
                    ? 'border-emerald-500/10 bg-emerald-500/5 text-slate-300'
                    : insight.type === 'warning'
                    ? 'border-amber-500/10 bg-amber-500/5 text-slate-300'
                    : insight.type === 'danger'
                    ? 'border-rose-500/10 bg-rose-500/5 text-slate-300'
                    : 'border-slate-800 bg-slate-900/30 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <AlertCircle
                    className={`h-4.5 w-4.5 ${
                      insight.type === 'success'
                        ? 'text-emerald-400'
                        : insight.type === 'warning'
                        ? 'text-amber-400'
                        : insight.type === 'danger'
                        ? 'text-rose-400'
                        : 'text-violet-400'
                    }`}
                  />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{insight.title}</h5>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass-panel rounded-2xl p-6 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-white">Últimas Transações</h4>
            <button
              onClick={() => setActiveTab('transactions')}
              className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-800/60 overflow-hidden rounded-xl border border-slate-800/40 bg-slate-950/40">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-900/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs ${
                        tx.type === 'receita'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {tx.type === 'receita' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{tx.description}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'receita' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                Nenhuma transação encontrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
