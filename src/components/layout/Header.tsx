import { Box, Flex, IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { UserMenu } from '../user/UserMenu';
import {
    useColorMode,
    useColorModeValue,
  } from "@/components/ui/color-mode"

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={6}
      py={4}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>NürnbergSpots Admin</h1>
        </Box>
        <Flex align="center" gap={4}>
          <IconButton
            aria-label={`${colorMode === 'light' ? 'Dark' : 'Light'} mode`}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
          >
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          <UserMenu />
        </Flex>
      </Flex>
    </Box>
  );
} 