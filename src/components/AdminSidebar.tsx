import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, PanelLeft, PanelLeftClose, X } from 'lucide-react';

import { adminNavGroups, isNavItemActive } from '@/lib/adminNavigation';
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/LoadingButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AdminSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
}

function NavItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: (typeof adminNavGroups)[number]['items'][number];
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center rounded-md text-sm transition-colors min-h-8',
        collapsed ? 'justify-center px-1 py-1.5' : 'gap-2 px-1.5 py-1.5',
        active
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn(
        'min-h-0 flex-1 overflow-y-auto py-2',
        collapsed ? 'px-1 space-y-3' : 'px-1 space-y-4'
      )}
      aria-label="Admin-Navigation"
    >
      {adminNavGroups.map((group, groupIndex) => (
        <div key={group.title}>
          {!collapsed && (
            <p className="px-1 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
          )}
          {collapsed && groupIndex > 0 && (
            <div className="mx-1 mb-1.5 border-t border-secondary" aria-hidden />
          )}
          <ul className="space-y-0.5">
            {group.items.map(item => (
              <li key={item.href}>
                <NavItem
                  item={item}
                  active={isNavItemActive(pathname, item)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({
  className,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  showClose = false,
  onClose,
}: AdminSidebarProps) {
  const ToggleIcon = collapsed ? PanelLeft : PanelLeftClose;

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-secondary bg-background transition-[width] duration-200 ease-out',
        collapsed ? 'w-12' : 'w-52 lg:w-56',
        className
      )}
    >
      <div
        className={cn('shrink-0 border-b border-secondary', collapsed ? 'px-1 py-2' : 'px-2 py-2')}
      >
        <div className={cn('flex items-center gap-2', collapsed ? 'flex-col' : 'justify-between')}>
          {!collapsed && (
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className="min-w-0 flex-1 truncate font-mono text-sm font-semibold leading-tight text-foreground"
            >
              Nürnbergspots
              <span className="block text-[11px] font-normal text-muted-foreground">Admin</span>
            </Link>
          )}

          {onToggleCollapse && (
            <LoadingButton
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleCollapse}
              className="shrink-0"
              aria-label={collapsed ? 'Navigation ausklappen' : 'Navigation einklappen'}
              aria-expanded={!collapsed}
            >
              <ToggleIcon className="h-4 w-4" />
            </LoadingButton>
          )}

          {collapsed && (
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className="font-mono text-sm font-bold text-foreground"
              aria-label="Nürnbergspots Admin Dashboard"
              title="Nürnbergspots Admin"
            >
              N
            </Link>
          )}

          {showClose && onClose && (
            <LoadingButton
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              aria-label="Navigation schließen"
            >
              <X className="h-4 w-4" />
            </LoadingButton>
          )}
        </div>
      </div>

      <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
    </aside>
  );
}

export function AdminSidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <LoadingButton
        type="button"
        variant="outline"
        size="icon"
        className="md:hidden shrink-0"
        onClick={() => setOpen(true)}
        aria-label="Navigation öffnen"
      >
        <Menu className="h-4 w-4" />
      </LoadingButton>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/80"
            aria-label="Navigation schließen"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(100vw-3rem,15rem)]">
            <AdminSidebar
              className="h-full w-full"
              showClose
              onClose={() => setOpen(false)}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
