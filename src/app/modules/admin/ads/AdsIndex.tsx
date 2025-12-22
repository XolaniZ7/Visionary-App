import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Code,
  Divider,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Link } from "@tanstack/react-router";
import ReactPrismjs from "@uiw/react-prismjs";
import React from "react";
import EmptyState from "src/app/components/EmptyState";

import type { RouterOutput } from "@server/trpc/router";

const AdsIndex = () => {
  const ads = trpc.admin.ads.getAll.useQuery();

  if (ads.isLoading) return <p>Loading...</p>;
  if (ads.data) {
    return (
      <div>
        <Flex p={3} mb={5} justifyContent="space-between">
          <Heading>Ads</Heading>
          <Link to="/app/admin/ads/create">
            <Button colorScheme="primary" bg="primary" _hover={{ background: "primaryHighlight" }}>
              Create Ad
            </Button>
          </Link>
        </Flex>
        <SimpleGrid gap={3} columns={{ base: 1, xl: 3 }} p={3}>
          {ads.data.map((ad) => (
            <Card bg="bg.one" key={ad.id}>
              <CardBody>
                <Stack mt="6" spacing="3">
                  <Heading size="md">{ad.id}</Heading>
                  <ReactPrismjs language="html" source={ad.code ?? ""} />
                </Stack>
              </CardBody>
              <Divider />
              <SimpleGrid gap={2} p={3} columns={2}>
                <Box p={3} bg="bg.two">
                  {ad.page}
                </Box>
                <Box p={3} bg="bg.two">
                  {ad.type}
                </Box>
              </SimpleGrid>
              <Divider />
              <CardFooter>
                <Flex justifyContent="space-between" w="full">
                  <HStack>
                    <ActivationButton ad={ad} />
                    <Link to="/app/admin/ads/$adId" params={{ adId: ad.id.toString() }}>
                      <Button variant="ghost" colorScheme="blue">
                        Edit
                      </Button>
                    </Link>
                  </HStack>
                  <DeleteAdModal ad={ad} />
                </Flex>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      </div>
    );
  }

  return <EmptyState title="No Ads" />;
};

export default AdsIndex;

type ActivationButtonProps = {
  ad: NonNullable<RouterOutput["admin"]["ads"]["get"]>;
};
function ActivationButton({ ad }: ActivationButtonProps) {
  const setStatusMutation = trpc.admin.ads.setStatus.useMutation();

  return (
    <div>
      {ad.status ? (
        <Button
          isLoading={setStatusMutation.isLoading}
          onClick={() =>
            setStatusMutation.mutate({
              id: ad.id,
              status: false,
            })
          }
          variant="outline"
          colorScheme="red"
        >
          Deactivate
        </Button>
      ) : (
        <Button
          isLoading={setStatusMutation.isLoading}
          onClick={() =>
            setStatusMutation.mutate({
              id: ad.id,
              status: true,
            })
          }
          variant="outline"
          colorScheme="green"
        >
          Activate
        </Button>
      )}
    </div>
  );
}

type DeleteAdModalProps = {
  ad: NonNullable<RouterOutput["admin"]["ads"]["get"]>;
};
const DeleteAdModal = ({ ad }: DeleteAdModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const toast = useToast();
  const deleteAd = trpc.admin.ads.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ad has been deleted",
        status: "success",
        isClosable: true,
        position: "top-right",
      });
    },
  });

  return (
    <>
      <Button onClick={onOpen} variant="ghost" colorScheme="red">
        Delete
      </Button>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Ad
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You cannot undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={deleteAd.isLoading}
                colorScheme="red"
                onClick={() => deleteAd.mutate({ id: ad.id })}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
