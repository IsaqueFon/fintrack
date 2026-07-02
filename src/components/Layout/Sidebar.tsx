import React from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  PieChart,
  Target,
  Calculator,
  Wallet,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transações', icon: ArrowUpDown },
    { id: 'budgets', name: 'Orçamentos', icon: PieChart },
    { id: 'goals', name: 'Metas de Economia', icon: Target },
    { id: 'calculators', name: 'Calculadoras', icon: Calculator },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/80 bg-slate-950 px-4 py-6 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">FinTrack</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-300 border-l-4 border-violet-500 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-white'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="border-t border-slate-900 pt-4 px-2 space-y-2">
          <div className="rounded-xl bg-slate-900/40 p-3.5 border border-slate-800/30">
            <p className="text-xs font-medium text-slate-500">Desenvolvido por:</p>
            <p className="text-xs font-bold text-slate-300">Isaque F.</p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-violet-400 font-semibold">
              <span>App Pessoal</span>
              <span className="rounded bg-violet-950 px-1 py-0.5 border border-violet-800/50">v1.0</span>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
};
