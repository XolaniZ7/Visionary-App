import { Flex, HStack } from "@chakra-ui/react";

import ColorModeSwitcher from "../../components/ColorModeSwitcher";
import RoleBadge from "../components/RoleBadge";

export const HeaderContent = () => {
  return (
    <Flex justifyContent="flex-end" align="center" p={2} px={6} minH="60px">
      <HStack>
        <RoleBadge />
        <ColorModeSwitcher />
      </HStack>
    </Flex>
  );
};
