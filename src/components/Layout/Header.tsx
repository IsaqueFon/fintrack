import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setSidebarOpen }) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Geral';
      case 'transactions':
        return 'Gerenciador de Transações';
      case 'budgets':
        return 'Orçamentos Mensais';
      case 'goals':
        return 'Metas de Poupança';
      case 'calculators':
        return 'Simuladores Financeiros';
      default:
        return 'FinTrack';
    }
  };

  const getTodayDateStr = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950 px-4 md:px-8">
      {/* Mobile Menu Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white md:text-xl">{getTabTitle(activeTab)}</h1>
          <p className="hidden text-xs text-slate-500 capitalize md:block">{getTodayDateStr()}</p>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Mock */}
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-violet-600 border border-slate-950" />
        </button>

        {/* User profile details */}
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-slate-200">Isaque F.</p>
            <p className="text-[10px] font-medium text-slate-500">Desenvolvedor</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
