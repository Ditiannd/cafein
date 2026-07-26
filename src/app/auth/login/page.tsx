'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 bg-[var(--color-brand-dark)] opacity-[0.03]" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[var(--color-brand-accent)]/10 rounded-full blur-[100px]" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Coffee className="h-12 w-12 text-[var(--color-brand-accent)]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-heading font-semibold text-foreground">
          Cafein Today
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-brand-muted)] tracking-wider uppercase">
          Staff Authentication Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-md py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none bg-transparent block w-full px-3 py-2 border border-white/20 rounded-lg shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-[var(--color-brand-accent)] focus:border-[var(--color-brand-accent)] sm:text-sm"
                  placeholder="admin@cafeintoday.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none bg-transparent block w-full px-3 py-2 border border-white/20 rounded-lg shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-[var(--color-brand-accent)] focus:border-[var(--color-brand-accent)] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-brand-accent)] bg-transparent focus:ring-[var(--color-brand-accent)] border-white/20 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-brand-muted)]">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <Button 
                variant="luxury" 
                className="w-full flex justify-center py-6 gap-2"
                disabled={isLoading}
              >
                <Lock className="w-4 h-4" />
                {isLoading ? 'Authenticating...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
