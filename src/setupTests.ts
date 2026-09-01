import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// RTL erkennt Fake-Timer nur über ein vorhandenes `jest`-Global (privat via
// jestFakeTimersAreEnabled + jest.advanceTimersByTime). Min-Shim für Vitest,
// damit waitFor() mit vi.useFakeTimers() richtig funktioniert.
if (typeof globalThis.jest === 'undefined') {
  globalThis.jest = {
    advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
  };
}

// Obergrenze 10s für waitFor / findBy* (Projektstandard, siehe CONSTITUTION.md)
configure({ asyncUtilTimeout: 10000 });

// Mock fetch global
global.fetch = vi.fn();

// API-Basis-URL für src/lib/api.ts (process.env, siehe vite.config define)
// Unreachable Loopback-Port — wird in Tests nie kontaktiert (fetch ist gemockt).
process.env.VITE_API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:5199/api';

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock URL.createObjectURL for file upload tests
let mockUrlCounter = 0;
global.URL.createObjectURL = vi.fn(() => `mock-url-${++mockUrlCounter}`);
global.URL.revokeObjectURL = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver / ResizeObserver (constructable classes — Vitest-Mocks
// (vi.fn) unterstützen kein `new`, Radix-Komponenten instanziieren sie aber via `new`.)
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserverMock;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// jsdom: Radix Select/ScrollArea etc. rufen scrollIntoView auf (siehe CONSTITUTION.md)
Element.prototype.scrollIntoView = vi.fn();

// Mock React Router
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock Firebase
vi.mock('./lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
}));

// Mock Sonner Toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock Auth Context
vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    isAuthenticated: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
