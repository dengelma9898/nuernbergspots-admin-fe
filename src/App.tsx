import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
