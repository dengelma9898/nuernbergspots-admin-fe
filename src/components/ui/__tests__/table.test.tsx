import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../table';

// Test Table Komponente für bessere Testbarkeit
const TestTable = ({ children, ...props }: { children?: React.ReactNode }) => (
  <Table data-testid="table" {...props}>
    <TableCaption data-testid="table-caption">Eine Liste der neuesten Rechnungen.</TableCaption>
    <TableHeader data-testid="table-header">
      <TableRow data-testid="header-row">
        <TableHead data-testid="table-head-1" className="w-[100px]">
          Rechnung
        </TableHead>
        <TableHead data-testid="table-head-2">Status</TableHead>
        <TableHead data-testid="table-head-3">Methode</TableHead>
        <TableHead data-testid="table-head-4" className="text-right">
          Betrag
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody data-testid="table-body">
      <TableRow data-testid="table-row-1">
        <TableCell data-testid="table-cell-1-1" className="font-medium">
          INV001
        </TableCell>
        <TableCell data-testid="table-cell-1-2">Bezahlt</TableCell>
        <TableCell data-testid="table-cell-1-3">Kreditkarte</TableCell>
        <TableCell data-testid="table-cell-1-4" className="text-right">
          €250.00
        </TableCell>
      </TableRow>
      <TableRow data-testid="table-row-2">
        <TableCell data-testid="table-cell-2-1" className="font-medium">
          INV002
        </TableCell>
        <TableCell data-testid="table-cell-2-2">Ausstehend</TableCell>
        <TableCell data-testid="table-cell-2-3">PayPal</TableCell>
        <TableCell data-testid="table-cell-2-4" className="text-right">
          €150.00
        </TableCell>
      </TableRow>
    </TableBody>
    <TableFooter data-testid="table-footer">
      <TableRow data-testid="footer-row">
        <TableCell data-testid="footer-cell-1" colSpan={3}>
          Gesamt
        </TableCell>
        <TableCell data-testid="footer-cell-2" className="text-right">
          €400.00
        </TableCell>
      </TableRow>
    </TableFooter>
    {children}
  </Table>
);

describe('Table Components', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Table', () => {
    it('sollte korrekt mit data-slot="table" gerendert werden', () => {
      render(
        <Table data-testid="test-table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      );

      const table = screen.getByTestId('test-table');
      expect(table).toHaveAttribute('data-slot', 'table');
      expect(table.tagName).toBe('TABLE');
    });

    it('sollte Container mit data-slot="table-container" haben', () => {
      render(
        <Table data-testid="test-table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      );

      const container = screen.getByTestId('test-table').parentElement;
      expect(container).toHaveAttribute('data-slot', 'table-container');
      expect(container).toHaveClass('relative', 'w-full', 'overflow-x-auto');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table data-testid="test-table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      );

      const table = screen.getByTestId('test-table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table className="custom-table" data-testid="test-table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      );

      const table = screen.getByTestId('test-table');
      expect(table).toHaveClass('custom-table');
    });

    it('sollte HTML-Attribute weiterleiten', () => {
      render(
        <Table id="my-table" role="grid" data-testid="test-table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      );

      const table = screen.getByTestId('test-table');
      expect(table).toHaveAttribute('id', 'my-table');
      expect(table).toHaveAttribute('role', 'grid');
    });
  });

  describe('TableHeader', () => {
    it('sollte korrekt mit data-slot="table-header" gerendert werden', () => {
      render(
        <Table>
          <TableHeader data-testid="test-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </Table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveAttribute('data-slot', 'table-header');
      expect(header.tagName).toBe('THEAD');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <TableHeader data-testid="test-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </Table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveClass('[&_tr]:border-b');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <TableHeader className="custom-header" data-testid="test-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </Table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('TableBody', () => {
    it('sollte korrekt mit data-slot="table-body" gerendert werden', () => {
      render(
        <Table>
          <TableBody data-testid="test-body">
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </Table>
      );

      const body = screen.getByTestId('test-body');
      expect(body).toHaveAttribute('data-slot', 'table-body');
      expect(body.tagName).toBe('TBODY');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <TableBody data-testid="test-body">
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </Table>
      );

      const body = screen.getByTestId('test-body');
      expect(body).toHaveClass('[&_tr:last-child]:border-0');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <TableBody className="custom-body" data-testid="test-body">
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </Table>
      );

      const body = screen.getByTestId('test-body');
      expect(body).toHaveClass('custom-body');
    });
  });

  describe('TableFooter', () => {
    it('sollte korrekt mit data-slot="table-footer" gerendert werden', () => {
      render(
        <Table>
          <TableFooter data-testid="test-footer">
            <tr>
              <td>Footer content</td>
            </tr>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toHaveAttribute('data-slot', 'table-footer');
      expect(footer.tagName).toBe('TFOOT');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <TableFooter data-testid="test-footer">
            <tr>
              <td>Footer content</td>
            </tr>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toHaveClass(
        'bg-muted/50',
        'border-t',
        'font-medium',
        '[&>tr]:last:border-b-0'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <TableFooter className="custom-footer" data-testid="test-footer">
            <tr>
              <td>Footer content</td>
            </tr>
          </TableFooter>
        </Table>
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('TableRow', () => {
    it('sollte korrekt mit data-slot="table-row" gerendert werden', () => {
      render(
        <Table>
          <tbody>
            <TableRow data-testid="test-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </Table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveAttribute('data-slot', 'table-row');
      expect(row.tagName).toBe('TR');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <tbody>
            <TableRow data-testid="test-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </Table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveClass(
        'hover:bg-muted/50',
        'data-[state=selected]:bg-muted',
        'border-b',
        'transition-colors'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <tbody>
            <TableRow className="custom-row" data-testid="test-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </Table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveClass('custom-row');
    });

    it('sollte selected state unterstützen', () => {
      render(
        <Table>
          <tbody>
            <TableRow data-state="selected" data-testid="test-row">
              <td>Selected row</td>
            </TableRow>
          </tbody>
        </Table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveAttribute('data-state', 'selected');
    });
  });

  describe('TableHead', () => {
    it('sollte korrekt mit data-slot="table-head" gerendert werden', () => {
      render(
        <Table>
          <thead>
            <tr>
              <TableHead data-testid="test-head">Header Cell</TableHead>
            </tr>
          </thead>
        </Table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveAttribute('data-slot', 'table-head');
      expect(head.tagName).toBe('TH');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <thead>
            <tr>
              <TableHead data-testid="test-head">Header Cell</TableHead>
            </tr>
          </thead>
        </Table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveClass(
        'text-foreground',
        'h-10',
        'px-2',
        'text-left',
        'align-middle',
        'font-medium',
        'whitespace-nowrap'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <thead>
            <tr>
              <TableHead className="custom-head" data-testid="test-head">
                Header Cell
              </TableHead>
            </tr>
          </thead>
        </Table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveClass('custom-head');
    });

    it('sollte Text-Inhalt anzeigen', () => {
      render(
        <Table>
          <thead>
            <tr>
              <TableHead data-testid="test-head">Name</TableHead>
            </tr>
          </thead>
        </Table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveTextContent('Name');
    });
  });

  describe('TableCell', () => {
    it('sollte korrekt mit data-slot="table-cell" gerendert werden', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell">Cell Content</TableCell>
            </tr>
          </tbody>
        </Table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveAttribute('data-slot', 'table-cell');
      expect(cell.tagName).toBe('TD');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell">Cell Content</TableCell>
            </tr>
          </tbody>
        </Table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveClass('p-2', 'align-middle', 'whitespace-nowrap');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <TableCell className="custom-cell" data-testid="test-cell">
                Cell Content
              </TableCell>
            </tr>
          </tbody>
        </Table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveClass('custom-cell');
    });

    it('sollte Text-Inhalt anzeigen', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell">Test Data</TableCell>
            </tr>
          </tbody>
        </Table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveTextContent('Test Data');
    });

    it('sollte colSpan und rowSpan unterstützen', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell" colSpan={2} rowSpan={3}>
                Spanning Cell
              </TableCell>
            </tr>
          </tbody>
        </Table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveAttribute('colSpan', '2');
      expect(cell).toHaveAttribute('rowSpan', '3');
    });
  });

  describe('TableCaption', () => {
    it('sollte korrekt mit data-slot="table-caption" gerendert werden', () => {
      render(
        <Table>
          <TableCaption data-testid="test-caption">Table Caption</TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </Table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toHaveAttribute('data-slot', 'table-caption');
      expect(caption.tagName).toBe('CAPTION');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Table>
          <TableCaption data-testid="test-caption">Table Caption</TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </Table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toHaveClass('text-muted-foreground', 'mt-4', 'text-sm');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Table>
          <TableCaption className="custom-caption" data-testid="test-caption">
            Table Caption
          </TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </Table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toHaveClass('custom-caption');
    });

    it('sollte Text-Inhalt anzeigen', () => {
      render(
        <Table>
          <TableCaption data-testid="test-caption">Eine Liste der Benutzer</TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </Table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toHaveTextContent('Eine Liste der Benutzer');
    });
  });

  describe('Complete Table', () => {
    it('sollte komplette Tabelle rendern', () => {
      render(
        <Table data-testid="complete-table">
          <TableCaption>Test Caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total: 1 user</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByTestId('complete-table')).toBeInTheDocument();
      expect(screen.getByText('Test Caption')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Total: 1 user')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte Table-Semantik haben', () => {
      render(<TestTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(4);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('sollte mit aria-label funktionieren', () => {
      render(
        <Table aria-label="Rechnungen Tabelle" data-testid="table">
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </Table>
      );

      const table = screen.getByLabelText('Rechnungen Tabelle');
      expect(table).toBeInTheDocument();
    });

    it('sollte mit aria-describedby funktionieren', () => {
      render(
        <div>
          <p id="table-description">Diese Tabelle zeigt alle Rechnungen</p>
          <Table aria-describedby="table-description" data-testid="table">
            <tbody>
              <tr>
                <td>Content</td>
              </tr>
            </tbody>
          </Table>
        </div>
      );

      const table = screen.getByTestId('table');
      expect(table).toHaveAttribute('aria-describedby', 'table-description');
    });

    it('sollte sortierbare Spalten unterstützen', () => {
      render(
        <Table>
          <thead>
            <tr>
              <TableHead aria-sort="ascending" data-testid="sortable-head">
                Name
              </TableHead>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </Table>
      );

      const head = screen.getByTestId('sortable-head');
      expect(head).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('Interaktionen', () => {
    it('sollte Row Click Handler unterstützen', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();

      render(
        <Table>
          <tbody>
            <TableRow onClick={onRowClick} data-testid="clickable-row">
              <TableCell>Clickable Content</TableCell>
            </TableRow>
          </tbody>
        </Table>
      );

      await user.click(screen.getByTestId('clickable-row'));
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    it('sollte Cell Click Handler unterstützen', async () => {
      const user = userEvent.setup();
      const onCellClick = vi.fn();

      render(
        <Table>
          <tbody>
            <tr>
              <TableCell onClick={onCellClick} data-testid="clickable-cell">
                Clickable Cell
              </TableCell>
            </tr>
          </tbody>
        </Table>
      );

      await user.click(screen.getByTestId('clickable-cell'));
      expect(onCellClick).toHaveBeenCalledTimes(1);
    });

    it('sollte Hover-Effekte haben', () => {
      render(
        <Table>
          <tbody>
            <TableRow data-testid="hoverable-row">
              <TableCell>Hoverable Content</TableCell>
            </TableRow>
          </tbody>
        </Table>
      );

      const row = screen.getByTestId('hoverable-row');
      expect(row).toHaveClass('hover:bg-muted/50');
    });
  });

  describe('Edge Cases', () => {
    it('sollte leere Tabelle handhaben', () => {
      render(<Table data-testid="empty-table"></Table>);

      const table = screen.getByTestId('empty-table');
      expect(table).toBeInTheDocument();
      expect(table).toBeEmptyDOMElement();
    });

    it('sollte nur Header ohne Body handhaben', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('sollte nur Body ohne Header handhaben', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('Data')).toBeInTheDocument();
    });

    it('sollte mit sehr vielen Zeilen umgehen', () => {
      const manyRows = Array.from({ length: 100 }, (_, i) => (
        <TableRow key={i}>
          <TableCell>Row {i}</TableCell>
        </TableRow>
      ));

      render(
        <Table>
          <TableBody>{manyRows}</TableBody>
        </Table>
      );

      expect(screen.getByText('Row 0')).toBeInTheDocument();
      expect(screen.getByText('Row 99')).toBeInTheDocument();
    });

    it('sollte mit komplexem Zelleninhalt umgehen', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <TableCell data-testid="complex-cell">
                <div>
                  <strong>Name:</strong> John Doe
                  <br />
                  <em>Email:</em> john@example.com
                  <button>Action</button>
                </div>
              </TableCell>
            </tr>
          </tbody>
        </Table>
      );

      const cell = screen.getByTestId('complex-cell');
      expect(cell).toContainHTML('<strong>Name:</strong>');
      expect(cell).toContainHTML('<em>Email:</em>');
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});
