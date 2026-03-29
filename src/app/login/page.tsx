'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { DEMO_MODE } from '@/lib/demo/config';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim() !== '' && password.trim() !== '' && !isLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await doLogin(email.trim(), password);
  }

  async function handleDemoLogin() {
    await doLogin('carlos@techfrio.com', 'demo123');
  }

  async function doLogin(loginEmail: string, loginPassword: string) {
    setIsLoading(true);
    setError(null);

    try {
      await login(loginEmail, loginPassword);
      if (DEMO_MODE) {
        sessionStorage.setItem('vobi-demo-session', 'true');
      }
      router.push('/service-orders');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao fazer login'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px] animate-fadeIn">
        {/* Logo */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            vobi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Checklist de Serviço
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-12 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground/70"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={DEMO_MODE ? 'carlos@techfrio.com' : 'seu@email.com'}
              className="h-12 w-full rounded-lg border border-border bg-white px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground/70"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={DEMO_MODE ? 'demo123' : '••••••••'}
                className="h-12 w-full rounded-lg border border-border bg-white px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98] active:transition-transform active:duration-100 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Demo mode */}
        {DEMO_MODE && (
          <>
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="h-12 w-full rounded-lg border border-border font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar como Carlos Silva (Demo)'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
