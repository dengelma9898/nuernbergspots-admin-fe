import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';

// Mock Auth Context
const mockLogin = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
    user: null,
    isAuthenticated: false,
    logout: jest.fn(),
  }),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('renders login form elements', () => {
    render(<Login />);
    
    // Teste ob die grundlegenden Elemente vorhanden sind
    expect(screen.getByText('Admin Login')).toBeTruthy();
    expect(screen.getByLabelText('E-Mail')).toBeTruthy();
    expect(screen.getByLabelText('Passwort')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Anmelden' })).toBeTruthy();
  });

  it('calls login function when form is submitted', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Formular vollständig ausfüllen bevor submit
    const emailInput = screen.getByLabelText('E-Mail');
    const passwordInput = screen.getByLabelText('Passwort');
    const submitButton = screen.getByRole('button', { name: 'Anmelden' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Verifiziere dass die Login-Funktion aufgerufen wurde
    expect(mockLogin).toHaveBeenCalled();
  });

  it('handles user input correctly', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Teste dass wir mit dem Formular interagieren können
    const emailInput = screen.getByLabelText('E-Mail');
    const passwordInput = screen.getByLabelText('Passwort');
    const button = screen.getByRole('button', { name: 'Anmelden' });
    
    // Teste Eingabe
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
    expect((passwordInput as HTMLInputElement).value).toBe('password123');
    
    // Teste Button-Klick
    await user.click(button);
    
    expect(mockLogin).toHaveBeenCalled();
  });
}); 