import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { KeywordSelector } from '../keyword-selector';
import { Keyword } from '@/models/keyword';

// Mock Keyword Service
const mockGetKeywords = jest.fn();
jest.mock('@/services/keywordService', () => ({
  useKeywordService: () => ({
    getKeywords: mockGetKeywords,
  }),
}));

// Mock Badge component
jest.mock('../badge', () => ({
  Badge: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    variant?: string;
  }>(({ children, className, variant, onClick, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="keyword-badge"
      data-variant={variant}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('KeywordSelector Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    selectedIds: [],
    onChange: mockOnChange,
  };

  // Mock keyword data
  const mockKeywords: Keyword[] = [
    {
      id: '1',
      name: 'React',
      description: 'React Framework',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'TypeScript',
      description: 'TypeScript Language',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'JavaScript',
      description: 'JavaScript Language',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Angular',
      description: 'Angular Framework',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetKeywords.mockResolvedValue(mockKeywords);
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', async () => {
      render(<KeywordSelector {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Angular')).toBeInTheDocument();
      });
    });

    it('sollte Container mit korrekten CSS-Klassen rendern', async () => {
      render(<KeywordSelector {...defaultProps} />);
      
      await waitFor(() => {
        const container = screen.getByText('React').closest('.space-y-2');
        expect(container).toBeInTheDocument();
      });
    });

    it('sollte custom className verwenden', async () => {
      render(<KeywordSelector {...defaultProps} className="custom-class" />);
      
      await waitFor(() => {
        const container = screen.getByText('React').closest('.space-y-2.custom-class');
        expect(container).toBeInTheDocument();
      });
    });

    it('sollte Badges mit korrekten Attributen rendern', async () => {
      render(<KeywordSelector {...defaultProps} />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('keyword-badge');
        expect(badges).toHaveLength(4);
        
        badges.forEach(badge => {
          expect(badge).toHaveClass('cursor-pointer', 'hover:bg-accent', 'transition-colors');
        });
      });
    });
  });

  describe('Loading State', () => {
    it('sollte Loading-Text verschwinden nach erfolgreichem Laden', async () => {
      render(<KeywordSelector {...defaultProps} />);
      
      // Warte bis die Keywords geladen sind
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Lade Keywords...')).not.toBeInTheDocument();
    });
  });

  describe('Keyword Sorting', () => {
    it('sollte Keywords alphabetisch sortieren', async () => {
      render(<KeywordSelector {...defaultProps} />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('keyword-badge');
        const keywordNames = badges.map(badge => badge.textContent);
        
        expect(keywordNames).toEqual(['Angular', 'JavaScript', 'React', 'TypeScript']);
      });
    });
  });

  describe('Selection State', () => {
    it('sollte unselected Keywords mit outline variant anzeigen', async () => {
      render(<KeywordSelector {...defaultProps} selectedIds={[]} />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('keyword-badge');
        badges.forEach(badge => {
          expect(badge).toHaveAttribute('data-variant', 'outline');
        });
      });
    });

    it('sollte selected Keywords mit default variant anzeigen', async () => {
      render(<KeywordSelector {...defaultProps} selectedIds={['1', '2']} />);
      
      await waitFor(() => {
        const reactBadge = screen.getByText('React');
        const typescriptBadge = screen.getByText('TypeScript');
        const javascriptBadge = screen.getByText('JavaScript');
        const angularBadge = screen.getByText('Angular');
        
        expect(reactBadge).toHaveAttribute('data-variant', 'default');
        expect(typescriptBadge).toHaveAttribute('data-variant', 'default');
        expect(javascriptBadge).toHaveAttribute('data-variant', 'outline');
        expect(angularBadge).toHaveAttribute('data-variant', 'outline');
      });
    });

    it('sollte gemischte Selection korrekt anzeigen', async () => {
      render(<KeywordSelector {...defaultProps} selectedIds={['2', '4']} />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('keyword-badge');
        const selectedBadges = badges.filter(badge => badge.getAttribute('data-variant') === 'default');
        const unselectedBadges = badges.filter(badge => badge.getAttribute('data-variant') === 'outline');
        
        expect(selectedBadges).toHaveLength(2);
        expect(unselectedBadges).toHaveLength(2);
      });
    });
  });

  describe('Selection Interaction', () => {
    it('sollte Keyword bei Klick auswählen', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('React'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['1']);
    });

    it('sollte Keyword bei Klick abwählen', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={['1']} />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('React'));
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('sollte mehrere Keywords auswählen können', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={['1']} />);
      
      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('TypeScript'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('sollte Keyword aus mehreren ausgewählten entfernen', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={['1', '2', '3']} />);
      
      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('TypeScript'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['1', '3']);
    });

    it('sollte onChange mit korrekten IDs aufrufen', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('Angular')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Angular'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['4']);
    });
  });

  describe('Props Handling', () => {
    it('sollte verschiedene selectedIds Props handhaben', async () => {
      const { rerender } = render(<KeywordSelector {...defaultProps} selectedIds={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
      
      // Alle unselected
      let badges = screen.getAllByTestId('keyword-badge');
      badges.forEach(badge => {
        expect(badge).toHaveAttribute('data-variant', 'outline');
      });
      
      // Einige selected
      rerender(<KeywordSelector {...defaultProps} selectedIds={['1', '3']} />);
      
      const reactBadge = screen.getByText('React');
      const javascriptBadge = screen.getByText('JavaScript');
      expect(reactBadge).toHaveAttribute('data-variant', 'default');
      expect(javascriptBadge).toHaveAttribute('data-variant', 'default');
    });

    it('sollte onChange prop korrekt handhaben', async () => {
      const customOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(<KeywordSelector selectedIds={[]} onChange={customOnChange} />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('React'));
      
      expect(customOnChange).toHaveBeenCalledWith(['1']);
    });

    it('sollte undefined selectedIds als leeres Array behandeln', async () => {
      render(<KeywordSelector onChange={mockOnChange} />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('keyword-badge');
        badges.forEach(badge => {
          expect(badge).toHaveAttribute('data-variant', 'outline');
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('sollte kompletter Selection Workflow funktionieren', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
      
      // 1. Erstes Keyword auswählen
      await user.click(screen.getByText('React'));
      expect(mockOnChange).toHaveBeenCalledWith(['1']);
      
      // 2. Zweites Keyword hinzufügen
      mockOnChange.mockClear();
      await user.click(screen.getByText('TypeScript'));
      expect(mockOnChange).toHaveBeenCalledWith(['2']);
    });

    it('sollte Sortierung und Selection zusammen funktionieren', async () => {
      const user = userEvent.setup();
      render(<KeywordSelector {...defaultProps} selectedIds={['2', '4']} />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('keyword-badge');
        const keywordNames = badges.map(badge => badge.textContent);
        
        // Sortiert: Angular, JavaScript, React, TypeScript
        expect(keywordNames).toEqual(['Angular', 'JavaScript', 'React', 'TypeScript']);
        
        // Angular (id: 4) und TypeScript (id: 2) sollten selected sein
        expect(screen.getByText('Angular')).toHaveAttribute('data-variant', 'default');
        expect(screen.getByText('TypeScript')).toHaveAttribute('data-variant', 'default');
        expect(screen.getByText('JavaScript')).toHaveAttribute('data-variant', 'outline');
        expect(screen.getByText('React')).toHaveAttribute('data-variant', 'outline');
      });
      
      // JavaScript auswählen
      await user.click(screen.getByText('JavaScript'));
      expect(mockOnChange).toHaveBeenCalledWith(['2', '4', '3']);
    });
  });
});
