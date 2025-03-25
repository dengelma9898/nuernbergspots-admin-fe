import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useColorMode } from "@/components/ui/color-mode"

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex h="100vh" bg={bgColor}>
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Header />
        <Box as="main" p={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
} 