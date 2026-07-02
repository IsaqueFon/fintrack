import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';
import { Calculator, Coins, Landmark, Calendar, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const CalculatorsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'juros' | 'amortizacao'>('juros');

  // Estados: Juros Compostos
  const [initialAmount, setInitialAmount] = useState('1000');
  const [monthlyContribution, setMonthlyContribution] = useState('200');
  const [annualRate, setAnnualRate] = useState('12');
  const [years, setYears] = useState('5');

  // Estados: Amortização
  const [loanAmount, setLoanAmount] = useState('50000');
  const [loanRate, setLoanRate] = useState('10');
  const [loanMonths, setLoanMonths] = useState('36');

  // Cálculo: Juros Compostos
  const calculateCompoundInterest = () => {
    const p = parseFloat(initialAmount) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const annualR = parseFloat(annualRate) || 0;
    const y = parseFloat(years) || 0;

    const r = annualR / 12 / 100; // taxa mensal decimal
    const totalMonths = y * 12;

    let accumulated = p;
    let totalInvested = p;
    const chartData: any[] = [];

    for (let month = 1; month <= totalMonths; month++) {
      accumulated = accumulated * (1 + r) + pmt;
      totalInvested += pmt;
      const totalInterest = accumulated - totalInvested;

      // Adicionar dados no gráfico anualmente ou no último mês
      if (month % 12 === 0 || month === totalMonths) {
        chartData.push({
          name: `Ano ${month / 12}`,
          Investido: Math.round(totalInvested),
          Juros: Math.round(totalInterest),
          Total: Math.round(accumulated)
        });
      }
    }

    const totalInterest = accumulated - totalInvested;

    return {
      accumulated,
      totalInvested,
      totalInterest,
      chartData
    };
  };

  // Cálculo: Amortização
  const calculateAmortization = () => {
    const loan = parseFloat(loanAmount) || 0;
    const rate = parseFloat(loanRate) || 0;
    const months = parseInt(loanMonths) || 0;

    const monthlyRate = rate / 12 / 100;

    // PRICE System Calculation
    // Prestação = Saldo * [ (i * (1+i)^n) / ((1+i)^n - 1) ]
    let pricePayment = 0;
    let priceTotalPaid = 0;
    let priceTotalInterest = 0;

    if (monthlyRate > 0) {
      pricePayment = (loan * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
      priceTotalPaid = pricePayment * months;
      priceTotalInterest = priceTotalPaid - loan;
    } else {
      pricePayment = loan / months;
      priceTotalPaid = loan;
      priceTotalInterest = 0;
    }

    // SAC System Calculation
    // Amortização constante = Saldo / n
    const sacAmortization = loan / months;
    let sacTotalInterest = 0;
    let currentBalance = loan;
    let sacFirstPayment = 0;
    let sacLastPayment = 0;

    for (let m = 1; m <= months; m++) {
      const interest = currentBalance * monthlyRate;
      const payment = sacAmortization + interest;
      if (m === 1) sacFirstPayment = payment;
      if (m === months) sacLastPayment = payment;

      sacTotalInterest += interest;
      currentBalance -= sacAmortization;
    }

    const sacTotalPaid = loan + sacTotalInterest;

    return {
      pricePayment,
      priceTotalPaid,
      priceTotalInterest,
      sacAmortization,
      sacFirstPayment,
      sacLastPayment,
      sacTotalInterest,
      sacTotalPaid
    };
  };

  const compoundResult = calculateCompoundInterest();
  const amortizationResult = calculateAmortization();

  return (
    <div className="space-y-6">
      {/* Sub Tabs Selection */}
      <div className="flex gap-2 rounded-xl bg-slate-900/60 p-1 border border-slate-800/40 w-fit">
        <button
          onClick={() => setActiveSubTab('juros')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeSubTab === 'juros'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="h-4 w-4" />
          Juros Compostos
        </button>
        <button
          onClick={() => setActiveSubTab('amortizacao')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeSubTab === 'amortizacao'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Landmark className="h-4 w-4" />
          Amortização (SAC vs PRICE)
        </button>
      </div>

      {activeSubTab === 'juros' ? (
        /* Juros Compostos View */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inputs Form */}
          <div className="glass-panel rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-violet-400" />
              Parâmetros
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Aporte Inicial (R$)
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Aporte Mensal (R$)
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Taxa de Juros Anual (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.1"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Período (Anos)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Details and Graph */}
          <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Investido</span>
                <p className="text-xl font-bold text-white mt-1">
                  {formatCurrency(compoundResult.totalInvested)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total em Juros</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  + {formatCurrency(compoundResult.totalInterest)}
                </p>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-indigo-950/30 to-violet-950/20 p-4">
                <span className="text-[10px] text-violet-300 uppercase tracking-wider font-semibold">Montante Acumulado</span>
                <p className="text-xl font-bold text-violet-400 mt-1">
                  {formatCurrency(compoundResult.accumulated)}
                </p>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Curva de Crescimento</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={compoundResult.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area
                      name="Valor Investido"
                      type="monotone"
                      dataKey="Investido"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="none"
                    />
                    <Area
                      name="Total Acumulado"
                      type="monotone"
                      dataKey="Total"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Amortização View */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inputs Form */}
          <div className="glass-panel rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-violet-400" />
              Parâmetros
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Valor Financiado (R$)
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Taxa de Juros Anual (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Prazo (Meses)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={loanMonths}
                    onChange={(e) => setLoanMonths(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Side by Side */}
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            {/* PRICE Panel */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="font-bold text-violet-400 text-sm">Tabela PRICE (Prestações Fixas)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">As parcelas permanecem as mesmas, amortizando mais juros no início</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Prestação Mensal</span>
                  <span className="font-bold text-white">{formatCurrency(amortizationResult.pricePayment)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Total Pago</span>
                  <span className="font-bold text-white">{formatCurrency(amortizationResult.priceTotalPaid)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Total de Juros</span>
                  <span className="font-bold text-rose-400">{formatCurrency(amortizationResult.priceTotalInterest)}</span>
                </div>
              </div>
            </div>

            {/* SAC Panel */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="font-bold text-violet-400 text-sm">Tabela SAC (Amortização Constante)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">As parcelas diminuem ao longo do tempo conforme o saldo diminui</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Primeira Prestação</span>
                  <span className="font-bold text-white">{formatCurrency(amortizationResult.sacFirstPayment)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Última Prestação</span>
                  <span className="font-bold text-white">{formatCurrency(amortizationResult.sacLastPayment)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Total Pago</span>
                  <span className="font-bold text-white">{formatCurrency(amortizationResult.sacTotalPaid)}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Total de Juros</span>
                  <span className="font-bold text-rose-400">{formatCurrency(amortizationResult.sacTotalInterest)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
