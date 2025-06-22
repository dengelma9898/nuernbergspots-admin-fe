import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar Komponente', () => {
  describe('Avatar Root', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<Avatar data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-slot', 'avatar');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Avatar data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass(
        'relative',
        'flex',
        'size-8',
        'shrink-0',
        'overflow-hidden',
        'rounded-full'
      );
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(<Avatar className="custom-class" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('custom-class');
    });

    it('sollte zusätzliche Props weiterleiten', () => {
      render(<Avatar data-testid="avatar" role="img" aria-label="User avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
    });
  });

  describe('AvatarImage', () => {
    it('sollte Avatar mit Image rendern', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/test-image.jpg" alt="Test User" />
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-slot', 'avatar');
    });
  });

  describe('AvatarFallback', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
    });

    it('sollte Text-Inhalt anzeigen', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent('JD');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass(
        'bg-muted',
        'flex',
        'size-full',
        'items-center',
        'justify-center',
        'rounded-full'
      );
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback-class" data-testid="avatar-fallback">
            JD
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('custom-fallback-class');
    });

    it('sollte verschiedene Inhaltstypen unterstützen', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">
            <span>👤</span>
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toContainHTML('<span>👤</span>');
    });
  });

  describe('Avatar Komposition', () => {
    it('sollte Avatar mit Image und Fallback zusammen rendern', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/test-image.jpg" alt="Test User" />
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
    });

    it('sollte nur mit Fallback funktionieren', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
    });

    it('sollte nur mit Image funktionieren', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/test-image.jpg" alt="Test User" />
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar');

      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute unterstützen', () => {
      render(
        <Avatar data-testid="avatar" role="img" aria-label="User profile picture">
          <AvatarImage src="/test-image.jpg" alt="John Doe" data-testid="avatar-image" />
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User profile picture');
    });

    it('sollte ARIA-Attribute für Accessibility unterstützen', () => {
      render(
        <Avatar data-testid="avatar" role="img" aria-label="User profile picture">
          <AvatarImage src="/test-image.jpg" alt="Profile picture of John Doe" />
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('role', 'img');
      expect(avatar).toHaveAttribute('aria-label', 'User profile picture');
    });
  });

  describe('Edge Cases', () => {
    it('sollte leeren Fallback-Text handhaben', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback"></AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toBeEmptyDOMElement();
    });

    it('sollte lange Fallback-Texte handhaben', () => {
      const longText = 'Very Long Name That Should Be Truncated';
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">{longText}</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveTextContent(longText);
    });

    it('sollte mit Image und Fallback zusammen funktionieren', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="invalid-url" alt="Test" />
          <AvatarFallback data-testid="avatar-fallback">FB</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar');
      const fallback = screen.getByTestId('avatar-fallback');

      expect(avatar).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
    });
  });
});
