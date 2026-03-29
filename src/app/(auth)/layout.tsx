'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { SyncIndicator } from '@/components/sync/SyncIndicator';
import { LogOut, Loader2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, loadSession, logout } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header — clean, flat, functional */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-white px-5 pt-[env(safe-area-inset-top)]">
        {/* Left: brand + user */}
        <div className="flex items-center">
          <span className="font-heading text-lg font-bold text-primary">
            vobi
          </span>
          <div className="mx-3 h-5 w-px bg-border" />
          <span className="max-w-[150px] truncate text-sm font-medium text-foreground">
            {user.fullName}
          </span>
        </div>

        {/* Right: sync + logout */}
        <div className="flex items-center gap-3">
          <SyncIndicator />
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Sair"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="min-h-screen flex-1 bg-background pt-4 pb-20">
        {children}
      </main>
    </div>
  );
}
