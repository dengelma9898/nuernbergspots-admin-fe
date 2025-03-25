import { Box, VStack, Icon, Text } from '@chakra-ui/react';
import { FaHome, FaStore, FaCalendarAlt, FaUsers, FaCog } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useColorModeValue } from "@/components/ui/color-mode"
const navItems = [
  { icon: FaHome, label: 'Dashboard', path: '/' },
  { icon: FaStore, label: 'Geschäfte', path: '/businesses' },
  { icon: FaCalendarAlt, label: 'Events', path: '/events' },
  { icon: FaUsers, label: 'Benutzer', path: '/users' },
  { icon: FaCog, label: 'Einstellungen', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const activeTextColor = useColorModeValue('blue.500', 'blue.200');

  return (
    <Box
      w="64"
      bg={bgColor}
      borderRight="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={4}
    >
      <VStack gap={1} align="stretch">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Box
                px={4}
                py={3}
                display="flex"
                alignItems="center"
                cursor="pointer"
                bg={isActive ? activeBgColor : 'transparent'}
                color={isActive ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                transition="all 0.2s"
              >
                <Icon as={item.icon} mr={3} />
                <Text>{item.label}</Text>
              </Box>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
} 