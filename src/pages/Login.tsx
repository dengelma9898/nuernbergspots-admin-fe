import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { useAuth } from '../contexts/AuthContext';


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Fehler beim Login',
        description: 'Bitte überprüfen Sie Ihre Anmeldedaten.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius={8}>
      <Stack gap={4}>
        <Heading>Admin Login</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Stack gap={4}>
            <Box>
              <label htmlFor="email">E-Mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Box>
              <label htmlFor="password">Passwort</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              loading={isLoading}
            >
              Anmelden
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
} 