import { Box, Heading, Image, Text } from "@chakra-ui/react";

type EmptyStateProps = {
  title: string;
  body?: string;
  noImage?: boolean;
};
const EmptyState = ({ title, body, noImage }: EmptyStateProps) => {
  return (
    <Box
      p={8}
      display="flex"
      alignItems="center"
      pt={20}
      gap={8}
      flexDirection="column"
      minH="full"
    >
      {noImage ? null : <Image rounded="lg" w="md" src="/screenwriter.jpg" />}
      <Heading>{title}</Heading>
      {body ? <Text>{body}</Text> : null}
    </Box>
  );
};

export default EmptyState;
