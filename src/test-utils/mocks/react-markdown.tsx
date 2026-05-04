import type { ReactNode } from 'react';

/** Minimaler Stub für Jest (react-markdown ist ESM-only). Siehe docs/TESTING.md */
export default function ReactMarkdown({ children }: { children?: ReactNode }) {
  return <div data-testid="react-markdown-mock">{children}</div>;
}
