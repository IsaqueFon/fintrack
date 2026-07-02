export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'receita' | 'despesa';
}

export interface Budget {
  category: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

const getRelativeDateStr = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Salário Principal',
    amount: 6500.00,
    category: 'Salário',
    date: getRelativeDateStr(28),
    type: 'receita'
  },
  {
    id: 'tx-2',
    description: 'Supermercado Pão de Açúcar',
    amount: 652.30,
    category: 'Alimentação',
    date: getRelativeDateStr(26),
    type: 'despesa'
  },
  {
    id: 'tx-3',
    description: 'Combustível Posto Ipiranga',
    amount: 180.00,
    category: 'Transporte',
    date: getRelativeDateStr(24),
    type: 'despesa'
  },
  {
    id: 'tx-4',
    description: 'Desenvolvimento Web Freelance',
    amount: 1200.00,
    category: 'Freelance',
    date: getRelativeDateStr(22),
    type: 'receita'
  },
  {
    id: 'tx-5',
    description: 'Assinatura Netflix',
    amount: 55.90,
    category: 'Lazer',
    date: getRelativeDateStr(20),
    type: 'despesa'
  },
  {
    id: 'tx-6',
    description: 'Aluguel do Apartamento',
    amount: 2200.00,
    category: 'Moradia',
    date: getRelativeDateStr(20),
    type: 'despesa'
  },
  {
    id: 'tx-7',
    description: 'Consulta Odontológica',
    amount: 250.00,
    category: 'Saúde',
    date: getRelativeDateStr(18),
    type: 'despesa'
  },
  {
    id: 'tx-8',
    description: 'Rendimento FIIs',
    amount: 145.20,
    category: 'Investimentos',
    date: getRelativeDateStr(15),
    type: 'receita'
  },
  {
    id: 'tx-9',
    description: 'Restaurante Temaki',
    amount: 189.00,
    category: 'Alimentação',
    date: getRelativeDateStr(12),
    type: 'despesa'
  },
  {
    id: 'tx-10',
    description: 'Mensalidade Faculdade',
    amount: 450.00,
    category: 'Educação',
    date: getRelativeDateStr(10),
    type: 'despesa'
  },
  {
    id: 'tx-11',
    description: 'Uber Viagens',
    amount: 45.80,
    category: 'Transporte',
    date: getRelativeDateStr(8),
    type: 'despesa'
  },
  {
    id: 'tx-12',
    description: 'Ingresso Show Rock',
    amount: 320.00,
    category: 'Lazer',
    date: getRelativeDateStr(5),
    type: 'despesa'
  },
  {
    id: 'tx-13',
    description: 'Venda de Item Antigo',
    amount: 300.00,
    category: 'Outros',
    date: getRelativeDateStr(3),
    type: 'receita'
  },
  {
    id: 'tx-14',
    description: 'Farmácia Drogasil',
    amount: 89.90,
    category: 'Saúde',
    date: getRelativeDateStr(2),
    type: 'despesa'
  },
  {
    id: 'tx-15',
    description: 'Cafeteira Expresso',
    amount: 349.00,
    category: 'Moradia',
    date: getRelativeDateStr(1),
    type: 'despesa'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { category: 'Alimentação', limit: 1200.00 },
  { category: 'Transporte', limit: 400.00 },
  { category: 'Moradia', limit: 2800.00 },
  { category: 'Lazer', limit: 600.00 },
  { category: 'Saúde', limit: 500.00 },
  { category: 'Educação', limit: 600.00 },
  { category: 'Outros', limit: 300.00 }
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Reserva de Emergência',
    target: 15000.00,
    current: 8500.00,
    deadline: getRelativeDateStr(-180) // 180 dias no futuro
  },
  {
    id: 'goal-2',
    name: 'Notebook Gamer Novo',
    target: 6000.00,
    current: 2400.00,
    deadline: getRelativeDateStr(-90) // 90 dias no futuro
  },
  {
    id: 'goal-3',
    name: 'Viagem de Férias',
    target: 8000.00,
    current: 1200.00,
    deadline: getRelativeDateStr(-240) // 240 dias no futuro
  }
];

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Outros'
];

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros'
];
