'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      router.refresh();
      if (user.role === 'admin') {
        router.push('/admin/overview');
      } else {
        router.push('/barista');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      
      {/* Background Radial Grid & Glowing Amber Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-5">
          <Coffee className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span>Cafein Today</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        <p className="mt-2 text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Staff & Admin Secure Gateway</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="card-luxury bg-zinc-900/95 border border-zinc-800/90 py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs rounded-xl p-3.5 text-center font-medium flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-500 bg-zinc-950 focus:ring-amber-500 border-zinc-700 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-xs text-zinc-400 hover:text-zinc-300 cursor-pointer select-none font-medium">
                  Remember this device
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="luxury" 
                type="submit"
                className="w-full flex justify-center py-4 text-sm gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]"
                disabled={isLoading}
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Authenticating Credentials...' : 'Access Staff Workspace'}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center text-[11px] font-mono text-zinc-600">
        Cafein Today Sandbox Floor Planner v2 Ecosystem • Unauthorized access is strictly logged.
      </div>
    </div>
  );
}
