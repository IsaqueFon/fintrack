import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS
} from '../utils/mockData';
import type { Transaction, Budget, SavingsGoal } from '../utils/mockData';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (newTransactions: Transaction[]) => void;
  updateBudget: (category: string, limit: number) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'current'>) => void;
  addGoalContribution: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização do estado a partir do LocalStorage com fallback para dados fictícios
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const local = localStorage.getItem('fintrack_transactions');
    return local ? JSON.parse(local) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const local = localStorage.getItem('fintrack_budgets');
    return local ? JSON.parse(local) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const local = localStorage.getItem('fintrack_goals');
    return local ? JSON.parse(local) : INITIAL_GOALS;
  });

  // Salvar no localStorage sempre que os estados mudarem
  useEffect(() => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fintrack_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('fintrack_goals', JSON.stringify(goals));
  }, [goals]);

  // Cálculos automáticos baseados nas transações
  const totalIncome = transactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  // O saldo total considera as receitas menos despesas, mas também reflete o valor acumulado em metas (que é retido)
  // Para fins didáticos e simplicidade, Saldo = Receitas - Despesas.
  const totalBalance = totalIncome - totalExpenses;

  // Funções de CRUD para Transações
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txWithId: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setTransactions((prev) => [txWithId, ...prev]);
  };

  const updateTransaction = (id: string, updatedTx: Omit<Transaction, 'id'>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...updatedTx, id } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const importTransactions = (newTransactions: Transaction[]) => {
    setTransactions((prev) => [...newTransactions, ...prev]);
  };

  // Funções para Orçamentos
  const updateBudget = (category: string, limit: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.category === category);
      if (exists) {
        return prev.map((b) => (b.category === category ? { ...b, limit } : b));
      } else {
        return [...prev, { category, limit }];
      }
    });
  };

  // Funções para Metas de Economia
  const addGoal = (newGoal: Omit<SavingsGoal, 'id' | 'current'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      current: 0,
    };
    setGoals((prev) => [...prev, goal]);
  };

  const addGoalContribution = (id: string, amount: number) => {
    // Para registrar a contribuição, subtraímos do saldo atual adicionando uma despesa virtual de investimentos
    // E adicionamos o valor ao acumulado da meta.
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newCurrent = Math.min(g.target, g.current + amount);
          return { ...g, current: newCurrent };
        }
        return g;
      })
    );

    // Registra uma transação de débito especial categoria "Investimentos" para registrar o fluxo
    const targetGoal = goals.find((g) => g.id === id);
    addTransaction({
      description: `Aporte: ${targetGoal?.name || 'Meta'}`,
      amount,
      category: 'Investimentos',
      date: new Date().toISOString().split('T')[0],
      type: 'despesa', // Tratado como despesa no fluxo de caixa líquido mensal
    });
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        totalBalance,
        totalIncome,
        totalExpenses,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        updateBudget,
        addGoal,
        addGoalContribution,
        deleteGoal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
