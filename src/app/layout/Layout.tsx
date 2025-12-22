import {
  Box,
  Flex,
  GridItem,
  IconButton,
  Show,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Outlet } from "@tanstack/react-router";
import { List as MenuIcon, X } from "phosphor-react";
import { useState } from "react";

import { HeaderContent } from "./HeaderContent";
import { SidebarContent } from "./SidebarContent";

const Layout = () => {
  const isMobile = useBreakpointValue({
    base: true,
    xl: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebarOpen = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <SimpleGrid columns={{ base: 1, xl: 12 }}>
      <Show below="xl">
        <GridItem bg="bg.base" colSpan={12}>
          <Box p={2} position="absolute" zIndex={10}>
            <IconButton
              variant="ghost"
              onClick={toggleSidebarOpen}
              aria-label="Toggle sidebar"
              icon={sidebarOpen ? <X size={32} /> : <MenuIcon size={32} />}
            />
          </Box>
        </GridItem>
      </Show>

      <GridItem display={{ base: "none", xl: "block" }} colSpan={2}>
        <SidebarContent sidebarOpen={sidebarOpen} toggleSidebarOpen={toggleSidebarOpen} />
      </GridItem>

      <GridItem minH="100vh" colSpan={{ base: 1, xl: 10 }}>
        {sidebarOpen && isMobile && (
          <Box w="full" h="full">
            <SidebarContent sidebarOpen={sidebarOpen} toggleSidebarOpen={toggleSidebarOpen} />
          </Box>
        )}
        <Box
          flexDirection="column"
          h="full"
          bg="bg.base"
          display={sidebarOpen && isMobile ? "none" : "flex"}
        >
          <HeaderContent />
          <Box h="full" p={{ base: 0, xl: 5 }}>
            <Outlet />
          </Box>
          <Flex
            borderTop="1px solid"
            borderColor="muted"
            mt="10"
            minH="20"
            justifyContent="center"
            alignItems="center"
            bg="bg.one"
          >
            Copyright © {new Date().getFullYear()} Visionary writings.
          </Flex>
        </Box>
      </GridItem>
    </SimpleGrid>
  );
};

export default Layout;
