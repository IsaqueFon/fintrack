import React, { useState } from 'react';
import { Wallet, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulando delay pequeno de rede para ficar mais profissional
    setTimeout(() => {
      const u = username.trim().toLowerCase();
      const p = password;

      const isValid = (u === 'isaque' || u === 'isaquefon') && (p === 'admin' || p === 'fintrack123');

      if (isValid) {
        localStorage.setItem('fintrack_auth', 'true');
        onLoginSuccess();
      } else {
        setError('Usuário ou senha incorretos.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md z-10">
        <div className="backdrop-blur-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/50">
          
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-4 animate-pulse">
              <Wallet className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">FinTrack</h2>
            <p className="mt-2 text-sm text-slate-400">Faça login para gerenciar suas finanças</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-semibold text-slate-400 tracking-wide uppercase px-1">
                Usuário
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  className="block w-full rounded-2xl border border-slate-800/60 bg-slate-950/50 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:bg-slate-950 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 tracking-wide uppercase px-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="block w-full rounded-2xl border border-slate-800/60 bg-slate-950/50 py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:bg-slate-950 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex w-full justify-center items-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Helper tooltip of credentials */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-600 transition-colors hover:text-slate-400 duration-300">
              Dica: use usuário <span className="font-semibold">isaquefon</span> e senha <span className="font-semibold">admin</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
