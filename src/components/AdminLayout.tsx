import { Outlet, useLocation } from 'react-router-dom';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { AdminSidebar, AdminSidebarMobile } from '@/components/AdminSidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/user/UserMenu';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAdminSidebar } from '@/hooks/useAdminSidebar';

export function AdminLayout() {
  const { pathname } = useLocation();
  const { collapsed, toggle } = useAdminSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-secondary focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        Zum Hauptinhalt springen
      </a>
      <CommandPalette />
      <div className="relative h-svh overflow-hidden">
        <Background />

        <div className="relative z-10 flex h-full">
          <nav className="hidden md:flex h-full shrink-0" aria-label="Hauptnavigation">
            <AdminSidebar collapsed={collapsed} onToggleCollapse={toggle} />
          </nav>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-secondary bg-background" role="banner">
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <AdminSidebarMobile />
                  <AdminBreadcrumbs pathname={pathname} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ThemeToggle />
                  <UserMenu />
                </div>
              </div>
            </header>

            <main
              className="min-h-0 flex-1 overflow-y-auto"
              id="main-content"
              tabIndex={-1}
              aria-label="Seiteninhalt"
            >
              <PageTransition>
                <Outlet />
              </PageTransition>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
