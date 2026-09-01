import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('sollte Card mit Standard-Props rendern', () => {
      render(<Card>Card Content</Card>);

      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('sollte custom className korrekt anwenden', () => {
      render(<Card className="custom-card">Custom Card</Card>);

      const card = screen.getByText('Custom Card');
      expect(card).toHaveClass('custom-card');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Card>Standard Card</Card>);

      const card = screen.getByText('Standard Card');
      expect(card).toHaveClass(
        'bg-card',
        'text-card-foreground',
        'flex',
        'flex-col',
        'gap-6',
        'rounded-lg',
        'border',
        'border-secondary',
        'py-6'
      );
    });
  });

  describe('CardHeader', () => {
    it('sollte CardHeader korrekt rendern', () => {
      render(<CardHeader>Header Content</CardHeader>);

      const header = screen.getByText('Header Content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('sollte Grid-Layout für Header mit Action haben', () => {
      render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>Action</CardAction>
        </CardHeader>
      );

      const header = screen.getByText('Title').parentElement;
      expect(header).toHaveClass('has-data-[slot=card-action]:grid-cols-[1fr_auto]');
    });
  });

  describe('CardTitle', () => {
    it('sollte CardTitle korrekt rendern', () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'card-title');
      expect(title).toHaveClass('leading-none', 'font-semibold');
    });

    it('sollte custom className für Title anwenden', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>);

      const title = screen.getByText('Custom Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('sollte CardDescription korrekt rendern', () => {
      render(<CardDescription>Card Description</CardDescription>);

      const description = screen.getByText('Card Description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'card-description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
    });
  });

  describe('CardAction', () => {
    it('sollte CardAction korrekt rendern', () => {
      render(<CardAction>Action Button</CardAction>);

      const action = screen.getByText('Action Button');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('sollte korrekte Grid-Position haben', () => {
      render(<CardAction>Action</CardAction>);

      const action = screen.getByText('Action');
      expect(action).toHaveClass(
        'col-start-2',
        'row-span-2',
        'row-start-1',
        'self-start',
        'justify-self-end'
      );
    });
  });

  describe('CardContent', () => {
    it('sollte CardContent korrekt rendern', () => {
      render(<CardContent>Content Area</CardContent>);

      const content = screen.getByText('Content Area');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'card-content');
      expect(content).toHaveClass('px-6');
    });
  });

  describe('CardFooter', () => {
    it('sollte CardFooter korrekt rendern', () => {
      render(<CardFooter>Footer Content</CardFooter>);

      const footer = screen.getByText('Footer Content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
      expect(footer).toHaveClass('flex', 'items-center', 'px-6');
    });

    it('sollte border-top Styling haben', () => {
      render(<CardFooter className="border-t">Footer with Border</CardFooter>);

      const footer = screen.getByText('Footer with Border');
      expect(footer).toHaveClass('[.border-t]:pt-6');
    });
  });

  describe('Vollständige Card', () => {
    it('sollte vollständige Card mit allen Komponenten rendern', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
    });

    it('sollte Card ohne Header rendern', () => {
      render(
        <Card>
          <CardContent>Content only</CardContent>
        </Card>
      );

      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('sollte Card ohne Footer rendern', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>No Footer Card</CardTitle>
          </CardHeader>
          <CardContent>Content without footer</CardContent>
        </Card>
      );

      expect(screen.getByText('No Footer Card')).toBeInTheDocument();
      expect(screen.getByText('Content without footer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte aria-label für Card setzen', () => {
      render(<Card aria-label="Product card">Product Info</Card>);

      const card = screen.getByLabelText('Product card');
      expect(card).toBeInTheDocument();
    });

    it('sollte role für Card setzen', () => {
      render(<Card role="article">Article Card</Card>);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('sollte heading-Hierarchie für Title respektieren', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
        </Card>
      );

      // Da CardTitle ein div ist, prüfen wir die Klassen
      const title = screen.getByText('Main Title');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('Custom Props', () => {
    it('sollte HTML Attribute für alle Komponenten weiterleiten', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
            <CardDescription data-testid="description">Description</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Layout Variationen', () => {
    it('sollte horizontales Layout unterstützen', () => {
      render(
        <Card className="flex-row">
          <CardContent>Left Content</CardContent>
          <CardContent>Right Content</CardContent>
        </Card>
      );

      const card = screen.getByText('Left Content').parentElement;
      expect(card).toHaveClass('flex-row');
    });

    it('sollte kompakte Card ohne Padding rendern', () => {
      render(
        <Card className="p-0" data-testid="compact-card">
          <CardContent className="p-4">Compact Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId('compact-card');
      expect(card).toHaveClass('p-0');
    });
  });

  describe('Interactive Cards', () => {
    it('sollte clickable Card unterstützen', () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} className="cursor-pointer" data-testid="clickable-card">
          <CardContent>Clickable Card</CardContent>
        </Card>
      );

      const card = screen.getByTestId('clickable-card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('sollte hover States unterstützen', () => {
      render(
        <Card className="hover:shadow-lg" data-testid="hover-card">
          <CardContent>Hover Card</CardContent>
        </Card>
      );

      const card = screen.getByTestId('hover-card');
      expect(card).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Content Types', () => {
    it('sollte mit komplexem Content umgehen', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <h3>Nested Title</h3>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('sollte mit Bildern umgehen', () => {
      render(
        <Card>
          <CardContent>
            <img src="/test.jpg" alt="Test Image" />
          </CardContent>
        </Card>
      );

      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leerem Content umgehen', () => {
      render(<Card data-testid="empty-card"></Card>);

      const card = screen.getByTestId('empty-card');
      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });

    it('sollte mit sehr langem Content umgehen', () => {
      const longContent = 'Lorem ipsum '.repeat(100);
      render(
        <Card>
          <CardContent data-testid="long-content">{longContent}</CardContent>
        </Card>
      );

      const content = screen.getByTestId('long-content');
      expect(content).toBeInTheDocument();
      // Prüfe nur, dass der Content vorhanden ist (Whitespace kann variieren)
      expect(content.textContent).toContain('Lorem ipsum');
      expect(content.textContent!.length).toBeGreaterThan(1000);
    });
  });
});
