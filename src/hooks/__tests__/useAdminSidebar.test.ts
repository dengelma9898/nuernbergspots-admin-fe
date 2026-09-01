import { describe, expect, it } from 'vitest';

import { useAdminSidebar } from '@/hooks/useAdminSidebar';
import { renderHook, act } from '@testing-library/react';

describe('useAdminSidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts expanded by default', () => {
    const { result } = renderHook(() => useAdminSidebar());
    expect(result.current.collapsed).toBe(false);
  });

  it('toggles and persists collapsed state', () => {
    const { result } = renderHook(() => useAdminSidebar());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(true);
    expect(localStorage.getItem('admin-sidebar-collapsed')).toBe('true');
  });
});
