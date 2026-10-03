import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ModerationBadge, EventTimeStatusBadge } from '@/components/events/EventStatusBadges';
import { moderationPendingBadgeClass } from '@/lib/designTokens';
import { EventStatus } from '@/utils/eventFormatters';
import { Clock } from 'lucide-react';

describe('EventStatusBadges Component', () => {
  describe('ModerationBadge', () => {
    it('rendert Badge bei status="PENDING" mit korrektem Text und ohne amber-100', () => {
      render(<ModerationBadge status="PENDING" />);
      const badge = screen.getByTestId('moderation-pending-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Ausstehend');
      expect(badge.className).not.toContain('amber-100');
      expect(badge.className).toContain('border-tertiary');
    });

    it('rendert nichts wenn status nicht "PENDING" ist', () => {
      const { container } = render(<ModerationBadge status="ACTIVE" />);
      expect(container.firstChild).toBeNull();
    });

    it('moderationPendingBadgeClass enthält border-tertiary und badgePreset-Klassen', () => {
      expect(moderationPendingBadgeClass).toContain('border-tertiary');
      expect(moderationPendingBadgeClass).toContain('rounded-md');
    });
  });

  describe('EventTimeStatusBadge', () => {
    it('rendert Status "Läuft jetzt" mit passendem Styling', () => {
      const status: EventStatus = {
        label: 'Läuft jetzt',
        icon: <Clock data-testid="time-icon" />,
        variant: 'default',
      };
      render(<EventTimeStatusBadge status={status} />);
      const badge = screen.getByTestId('event-time-status-badge');
      expect(badge).toHaveTextContent('Läuft jetzt');
      expect(screen.getByTestId('time-icon')).toBeInTheDocument();
      expect(badge.className).toContain('bg-primary');
    });

    it('rendert Status "Beendet" mit muted Styling', () => {
      const status: EventStatus = {
        label: 'Beendet',
        icon: <Clock data-testid="time-icon" />,
        variant: 'secondary',
      };
      render(<EventTimeStatusBadge status={status} />);
      const badge = screen.getByTestId('event-time-status-badge');
      expect(badge).toHaveTextContent('Beendet');
      expect(badge.className).toContain('bg-muted');
    });

    it('rendert Status "Kommend" mit outline Styling', () => {
      const status: EventStatus = {
        label: 'Kommend',
        icon: <Clock data-testid="time-icon" />,
        variant: 'outline',
      };
      render(<EventTimeStatusBadge status={status} />);
      const badge = screen.getByTestId('event-time-status-badge');
      expect(badge).toHaveTextContent('Kommend');
      expect(badge.className).toContain('border-secondary');
    });
  });
});
