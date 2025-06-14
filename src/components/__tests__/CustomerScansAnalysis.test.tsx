import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomerScansAnalysis } from '../CustomerScansAnalysis';

// Mock Business Data
const mockBusinessData = [
  {
    businessName: 'Restaurant ABC',
    scans: [
      {
        customerId: 'customer1',
        scannedAt: '2024-01-15T10:30:00Z',
        price: 25.50,
        numberOfPeople: 2,
        benefit: '10% Rabatt',
        businessName: 'Restaurant ABC',
      },
    ],
  },
];

describe('CustomerScansAnalysis Component', () => {
  it('renders the component successfully', () => {
    render(<CustomerScansAnalysis businesses={mockBusinessData} />);
    
    // Teste nur ob die Hauptüberschrift vorhanden ist
    expect(screen.getByText('Detaillierte Scan-Analyse')).toBeTruthy();
  });

  it('renders with empty business data', () => {
    render(<CustomerScansAnalysis businesses={[]} />);
    
    // Teste dass die Komponente auch mit leeren Daten funktioniert
    expect(screen.getByText('Detaillierte Scan-Analyse')).toBeTruthy();
  });

  it('renders select elements', () => {
    render(<CustomerScansAnalysis businesses={mockBusinessData} />);
    
    // Teste ob Select-Elemente vorhanden sind (über role)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('renders without crashing with complex data', () => {
    const complexBusinessData = [
      {
        businessName: 'Test Business',
        scans: Array.from({ length: 5 }, (_, i) => ({
          customerId: `customer${i}`,
          scannedAt: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
          price: 10 + i,
          numberOfPeople: 1 + i,
          benefit: `Benefit ${i}`,
          businessName: 'Test Business',
        })),
      },
    ];

    render(<CustomerScansAnalysis businesses={complexBusinessData} />);
    
    expect(screen.getByText('Detaillierte Scan-Analyse')).toBeTruthy();
  });

  it('handles component props correctly', () => {
    // Test mit leeren props (statt undefined)
    render(<CustomerScansAnalysis businesses={[]} />);
    
    expect(screen.getByText('Detaillierte Scan-Analyse')).toBeTruthy();
  });
}); 