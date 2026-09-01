import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { IconPicker } from '../icon-picker';

vi.mock('@/lib/allowed-material-icons', () => ({
  ALLOWED_MATERIAL_ICONS: ['home', 'restaurant', 'local_cafe', 'storefront'],
}));

vi.mock('../material-icon', () => ({
  MaterialIcon: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`}>{icon}</span>,
}));

const mockVirtualizer = {
  getVirtualItems: vi.fn(() => [
    { index: 0, start: 0, size: 40, end: 40, key: '0' },
    { index: 1, start: 40, size: 40, end: 80, key: '1' },
  ]),
  getTotalSize: vi.fn(() => 80),
  scrollToIndex: vi.fn(),
  scrollToOffset: vi.fn(),
};

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => mockVirtualizer),
}));

vi.mock('../input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
      <input ref={ref} data-testid="search-input" className={className} {...props} />
    )
  ),
}));

vi.mock('../scroll-area', () => ({
  ScrollArea: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} data-testid="scroll-area" className={className} {...props}>
        {children}
      </div>
    )
  ),
}));

describe('IconPicker Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders search input and scroll area', () => {
    render(<IconPicker {...defaultProps} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('shows preview for selected snake_case icon', () => {
    render(<IconPicker {...defaultProps} value="local_cafe" />);
    expect(screen.getByTestId('icon-local_cafe')).toBeInTheDocument();
  });

  it('calls onChange with snake_case icon name when clicked', async () => {
    const user = userEvent.setup();
    render(<IconPicker {...defaultProps} />);

    await user.click(screen.getByTitle('home'));
    expect(mockOnChange).toHaveBeenCalledWith('home');
  });

  it('filters icons by search term', async () => {
    const user = userEvent.setup();
    render(<IconPicker {...defaultProps} />);

    await user.type(screen.getByTestId('search-input'), 'cafe');
    expect(screen.getByTitle('local_cafe')).toBeInTheDocument();
  });
});
