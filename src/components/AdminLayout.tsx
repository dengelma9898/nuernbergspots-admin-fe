import { Outlet, useLocation } from 'react-router-dom';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { AdminSidebar, AdminSidebarMobile } from '@/components/AdminSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/user/UserMenu';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAdminSidebar } from '@/hooks/useAdminSidebar';

export function AdminLayout() {
  const { pathname } = useLocation();
  const { collapsed, toggle } = useAdminSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative h-svh overflow-hidden">
        <Background />

        <div className="relative z-10 flex h-full">
          <div className="hidden md:flex h-full shrink-0">
            <AdminSidebar collapsed={collapsed} onToggleCollapse={toggle} />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-secondary bg-background">
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

            <main className="min-h-0 flex-1 overflow-y-auto" id="main-content">
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
