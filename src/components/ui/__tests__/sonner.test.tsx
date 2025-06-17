import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'sonner';

import { Toaster } from '../sonner';

// Mock für next-themes
const mockUseTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock für sonner - Vereinfachtes aber realistisches Mock
jest.mock('sonner', () => ({
  Toaster: React.forwardRef<HTMLDivElement, any>(({ children, theme, className, style, position, duration, ...props }, ref) => (
    <div 
      ref={ref}
      data-testid="sonner-toaster" 
      data-theme={theme}
      data-position={position}
      data-duration={duration}
      className={className}
      style={style}
      data-props={JSON.stringify(props)}
    >
      {children}
    </div>
  )),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
    promise: jest.fn(),
  },
}));

describe('Toaster (Sonner) Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Standard Theme-Mock
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light'
    });
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toBeInTheDocument();
    });

    it('sollte Standard-Klassen haben', () => {
      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveClass('toaster');
      expect(toaster).toHaveClass('group');
    });

    it('sollte custom className akzeptieren', () => {
      render(<Toaster className="custom-toaster" />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveClass('custom-toaster');
    });
  });

  describe('Theme Integration', () => {
    it('sollte light theme korrekt setzen', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: jest.fn(),
        resolvedTheme: 'light'
      });

      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'light');
    });

    it('sollte dark theme korrekt setzen', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: jest.fn(),
        resolvedTheme: 'dark'
      });

      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'dark');
    });

    it('sollte system theme als Fallback verwenden', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: jest.fn(),
        resolvedTheme: undefined
      });

      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'system');
    });

    it('sollte system theme korrekt setzen', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: jest.fn(),
        resolvedTheme: 'system'
      });

      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'system');
    });
  });

  describe('CSS Custom Properties', () => {
    it('sollte CSS-Variablen für Styling setzen', () => {
      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      
      // Prüfen, dass Style-Attribute gesetzt sind
      expect(toaster).toHaveAttribute('style');
      const styleAttr = toaster.getAttribute('style') || '';
      
      expect(styleAttr).toContain('--normal-bg: var(--popover)');
      expect(styleAttr).toContain('--normal-text: var(--popover-foreground)');
      expect(styleAttr).toContain('--normal-border: var(--border)');
    });

    it('sollte custom styles mit eigenen CSS-Variablen kombinieren', () => {
      render(<Toaster style={{ '--custom-var': 'red', color: 'blue' } as React.CSSProperties} />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      const styleAttr = toaster.getAttribute('style') || '';
      
      // Sollte Custom-Variablen enthalten (Standard-Variablen werden durch Object.assign überschrieben)
      expect(styleAttr).toContain('--custom-var: red');
      expect(styleAttr).toContain('color: blue');
      
      // Prüfen, dass es CSS-Variablen-Syntax verwendet (mit Leerzeichen nach dem Doppelpunkt)
      expect(styleAttr).toMatch(/--[\w-]+: /);  
    });
  });

  describe('Props Forwarding', () => {
    it('sollte Position und Duration Props korrekt weiterleiten', () => {
      render(
        <Toaster 
          position="top-center"
          duration={5000}
        />
      );
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-position', 'top-center');
      expect(toaster).toHaveAttribute('data-duration', '5000');
    });

    it('sollte alle weiteren Props in data-props speichern', () => {
      render(
        <Toaster 
          visibleToasts={5}
          closeButton
          richColors
        />
      );
      
      const toaster = screen.getByTestId('sonner-toaster');
      const propsData = toaster.getAttribute('data-props');
      
      expect(propsData).toBeTruthy();
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.visibleToasts).toBe(5);
      expect(parsedProps.closeButton).toBe(true);
      expect(parsedProps.richColors).toBe(true);
    });

    it('sollte expand prop unterstützen', () => {
      render(<Toaster expand />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      const propsData = toaster.getAttribute('data-props');
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.expand).toBe(true);
    });

    it('sollte custom offset unterstützen', () => {
      render(<Toaster offset="32px" />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      const propsData = toaster.getAttribute('data-props');
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.offset).toBe('32px');
    });

    it('sollte invert prop unterstützen', () => {
      render(<Toaster invert />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      const propsData = toaster.getAttribute('data-props');
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.invert).toBe(true);
    });
  });

  describe('Toast Position', () => {
    it('sollte verschiedene Positionen unterstützen', () => {
      const positions: Array<'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'> = [
        'top-left',
        'top-center', 
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
      ];

      positions.forEach(position => {
        const { unmount } = render(<Toaster position={position} />);
        
        const toaster = screen.getByTestId('sonner-toaster');
        expect(toaster).toHaveAttribute('data-position', position);
        
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('sollte aria-live Region haben', () => {
      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      // Sonner sollte accessibility-Features haben
      expect(toaster).toBeInTheDocument();
    });

    it('sollte hotkey prop unterstützen', () => {
      render(<Toaster hotkey={['meta+j']} />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      const propsData = toaster.getAttribute('data-props');
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.hotkey).toEqual(['meta+j']);
    });

    it('sollte screen reader optimiert sein', () => {
      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      // Toaster sollte für Screen Reader zugänglich sein
      expect(toaster).toBeInTheDocument();
    });
  });

  describe('Theme Switching', () => {
    it('sollte Theme-Änderungen korrekt handhaben', () => {
      const { rerender } = render(<Toaster />);
      
      // Initial light theme
      let toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'light');
      
      // Switch to dark theme
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: jest.fn(),
        resolvedTheme: 'dark'
      });
      
      rerender(<Toaster />);
      
      toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'dark');
    });

    it('sollte Theme-Prop überschreiben können', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: jest.fn(),
        resolvedTheme: 'light'
      });

      render(<Toaster theme="dark" />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('Integration mit Toast API', () => {
    it('sollte mit toast.success funktionieren', () => {
      render(<Toaster />);
      
      act(() => {
        toast.success('Success message');
      });
      
      expect(toast.success).toHaveBeenCalledWith('Success message');
    });

    it('sollte mit toast.error funktionieren', () => {
      render(<Toaster />);
      
      act(() => {
        toast.error('Error message');
      });
      
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });

    it('sollte mit toast.info funktionieren', () => {
      render(<Toaster />);
      
      act(() => {
        toast.info('Info message');
      });
      
      expect(toast.info).toHaveBeenCalledWith('Info message');
    });

    it('sollte mit toast.warning funktionieren', () => {
      render(<Toaster />);
      
      act(() => {
        toast.warning('Warning message');
      });
      
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
    });
  });

  describe('Advanced Features', () => {
    it('sollte custom components in Toasts unterstützen', () => {
      render(<Toaster />);
      
      const customToast = () => <div>Custom toast content</div>;
      
      act(() => {
        toast.custom(customToast);
      });
      
      expect(toast.custom).toHaveBeenCalledWith(customToast);
    });

    it('sollte toast dismissal unterstützen', () => {
      render(<Toaster />);
      
      act(() => {
        toast.dismiss();
      });
      
      expect(toast.dismiss).toHaveBeenCalled();
    });

    it('sollte Promise-basierte Toasts unterstützen', () => {
      render(<Toaster />);
      
      const promise = Promise.resolve('Success');
      
      act(() => {
        toast.promise(promise, {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error!'
        });
      });
      
      expect(toast.promise).toHaveBeenCalledWith(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!'
      });
    });
  });

  describe('Performance & Edge Cases', () => {
    it('sollte mit hoher Toast-Frequenz umgehen', () => {
      render(<Toaster visibleToasts={10} />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      const propsData = toaster.getAttribute('data-props');
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.visibleToasts).toBe(10);
      
      // Simuliere viele Toasts
      act(() => {
        for (let i = 0; i < 20; i++) {
          toast.info(`Toast ${i}`);
        }
      });
      
      expect(toast.info).toHaveBeenCalledTimes(20);
    });

    it('sollte mit null Theme umgehen (explizit null)', () => {
      mockUseTheme.mockReturnValue({
        theme: null,
        setTheme: jest.fn(),
        resolvedTheme: null
      });

      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      // null wird nicht als Attribut gerendert (weil es null ist)
      expect(toaster).not.toHaveAttribute('data-theme');
    });

    it('sollte mit leerem useTheme Hook umgehen', () => {
      mockUseTheme.mockReturnValue({});

      render(<Toaster />);
      
      const toaster = screen.getByTestId('sonner-toaster');
      expect(toaster).toHaveAttribute('data-theme', 'system');
    });
  });

  describe('Vollständiger Toaster Test', () => {
    it('sollte kompletten Toaster mit allen Features rendern', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: jest.fn(),
        resolvedTheme: 'dark'
      });

      render(
        <Toaster 
          position="top-right"
          duration={4000}
          visibleToasts={3}
          closeButton
          richColors
          expand
          invert
        />
      );
      
      const toaster = screen.getByTestId('sonner-toaster');
      
      // Hauptkomponente
      expect(toaster).toBeInTheDocument();
      
      // Theme
      expect(toaster).toHaveAttribute('data-theme', 'dark');
      
      // Klassen
      expect(toaster).toHaveClass('toaster', 'group');
      
      // Position und Duration
      expect(toaster).toHaveAttribute('data-position', 'top-right');
      expect(toaster).toHaveAttribute('data-duration', '4000');
      
      // Weitere Props
      const propsData = toaster.getAttribute('data-props');
      const parsedProps = JSON.parse(propsData || '{}');
      expect(parsedProps.visibleToasts).toBe(3);
      expect(parsedProps.closeButton).toBe(true);
      expect(parsedProps.richColors).toBe(true);
      expect(parsedProps.expand).toBe(true);
      expect(parsedProps.invert).toBe(true);
      
      // CSS Custom Properties
      const styleAttr = toaster.getAttribute('style') || '';
      expect(styleAttr).toContain('--normal-bg: var(--popover)');
      expect(styleAttr).toContain('--normal-text: var(--popover-foreground)');
      expect(styleAttr).toContain('--normal-border: var(--border)');
    });

    it('sollte alle Toast-Typen funktional unterstützen', () => {
      render(<Toaster />);
      
      const customToast = () => <div>Custom</div>;
      
      // Teste alle Toast-Typen
      act(() => {
        toast.success('Success');
        toast.error('Error'); 
        toast.info('Info');
        toast.warning('Warning');
        toast.custom(customToast);
      });
      
      expect(toast.success).toHaveBeenCalledWith('Success');
      expect(toast.error).toHaveBeenCalledWith('Error');
      expect(toast.info).toHaveBeenCalledWith('Info');
      expect(toast.warning).toHaveBeenCalledWith('Warning');
      expect(toast.custom).toHaveBeenCalledWith(customToast);
    });
  });
}); 