import { Badge, HStack } from "@chakra-ui/react";

import { IsAdmin, IsAuthor, IsReader } from "../layout/AuthBlocks";

const RoleBadge = () => {
  return (
    <HStack>
      <IsAdmin>
        <Badge>Admin</Badge>
      </IsAdmin>
      <IsAuthor>
        <Badge>Author</Badge>
      </IsAuthor>
      <IsReader>
        <Badge>Reader</Badge>
      </IsReader>
    </HStack>
  );
};

export default RoleBadge;
