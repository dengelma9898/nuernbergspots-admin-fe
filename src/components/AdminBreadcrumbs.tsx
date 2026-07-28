import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { buildBreadcrumbs } from '@/lib/adminNavigation';

interface AdminBreadcrumbsProps {
  pathname: string;
}

export function AdminBreadcrumbs({ pathname }: AdminBreadcrumbsProps) {
  const crumbs = buildBreadcrumbs(pathname);

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
              <li className="min-w-0">
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors truncate block max-w-[12rem] sm:max-w-none"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className="text-foreground font-medium truncate block max-w-[12rem] sm:max-w-none"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
