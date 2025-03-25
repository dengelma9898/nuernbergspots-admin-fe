import { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Button, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/users';
import { useUserService } from '../services/userService';

export function Dashboard() {
  const { logout, getUserId } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userService = useUserService();
  const isInitialMount = useRef(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    const userId = getUserId();
    if (!userId || isLoading) return;

    try {
      setIsLoading(true);
      const userData = await userService.getUserProfile(userId);
      setCurrentUser(userData);
      console.log('User Profile Data:', userData); // Für Debugging
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getUserId, userService, isLoading]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  return (
    <Box p={8}>
      <Stack gap={4}>
        <Heading>Admin Dashboard</Heading>
        
        {/* Eingeloggter Benutzer */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg="white" shadow="sm">
          <VStack align="stretch" gap={4}>
            <Heading size="md">Benutzerprofil</Heading>
            
            {currentUser ? (
              <>
                {/* Basis Informationen */}
                <Box>
                  <Heading size="sm" mb={2}>Basis Informationen</Heading>
                  <Stack gap={2}>
                    <Text><strong>E-Mail:</strong> {currentUser.email}</Text>
                    <Text><strong>Benutzertyp:</strong> {currentUser.userType}</Text>
                    <Text><strong>Management ID:</strong> {currentUser.managementId}</Text>
                    {currentUser.name && <Text><strong>Name:</strong> {currentUser.name}</Text>}
                  </Stack>
                </Box>

                {/* Präferenzen */}
                {(currentUser.preferences?.length || currentUser.language) && (
                  <Box>
                    <Heading size="sm" mb={2}>Präferenzen</Heading>
                    <Stack gap={2}>
                      {currentUser.language && <Text><strong>Sprache:</strong> {currentUser.language}</Text>}
                      {currentUser.preferences?.length && (
                        <Text><strong>Interessen:</strong> {currentUser.preferences.join(', ')}</Text>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Standort & Zeitliche Informationen */}
                <Box>
                  <Heading size="sm" mb={2}>Standort & Zeitliche Informationen</Heading>
                  <Stack gap={2}>
                    {currentUser.currentCityId && (
                      <Text><strong>Aktuelle Stadt ID:</strong> {currentUser.currentCityId}</Text>
                    )}
                    {currentUser.livingInCitySinceYear && (
                      <Text><strong>In der Stadt seit:</strong> {currentUser.livingInCitySinceYear}</Text>
                    )}
                    {currentUser.memberSince && (
                      <Text><strong>Mitglied seit:</strong> {new Date(currentUser.memberSince).toLocaleDateString()}</Text>
                    )}
                  </Stack>
                </Box>

                {/* Business Aktivitäten */}
                <Box>
                  <Heading size="sm" mb={2}>Business Aktivitäten</Heading>
                  <Stack gap={2}>
                    <Text><strong>Besuchte Geschäfte:</strong> {currentUser.businessHistory?.length || 0}</Text>
                    <Text><strong>Favorisierte Events:</strong> {currentUser.favoriteEventIds?.length || 0}</Text>
                    <Text><strong>Favorisierte Businesses:</strong> {currentUser.favoriteBusinessIds?.length || 0}</Text>
                  </Stack>
                </Box>

                {/* Letzte Besuche */}
                {currentUser.businessHistory && currentUser.businessHistory.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>Letzte Besuche</Heading>
                    <Stack gap={2}>
                      {currentUser.businessHistory.slice(0, 5).map((visit, index) => (
                        <Box key={index} p={2} borderWidth={1} borderRadius="md">
                          <Text><strong>{visit.businessName}</strong></Text>
                          <Text fontSize="sm">Benefit: {visit.benefit}</Text>
                          <Text fontSize="sm">Besucht am: {new Date(visit.visitedAt).toLocaleDateString()}</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            ) : (
              <Text>Lade Benutzerdaten...</Text>
            )}
          </VStack>
        </Box>

        <Button onClick={handleLogout} colorScheme="red">
          Abmelden
        </Button>
      </Stack>
    </Box>
  );
} 