import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  InputGroup,
  Link,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { PlusCircle } from "phosphor-react";
import React from "react";
import EmptyState from "src/app/components/EmptyState";
import { usePrimaryColorScheme } from "src/app/theme";
import type { Singular } from "src/shared/types";
import { z } from "zod";

import type { RouterOutput } from "@server/trpc/router";

const RestrictionsIndex = () => {
  return (
    <Container maxW="container.lg">
      <Heading mb={3}>Restrictions</Heading>
      <Tabs isFitted>
        <TabList>
          <Tab>Links</Tab>
          <Tab>Words</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <RestrictedLinksList />
          </TabPanel>
          <TabPanel>
            <RestrictedWordsList />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

const RestrictedLinksList = () => {
  const links = trpc.admin.restrictions.links.getAll.useQuery();

  if (links.isLoading) return <p>Loading...</p>;

  if (links.data) {
    return (
      <VStack>
        <Flex w="full">
          <AddNewLinkForm />
        </Flex>
        {links.data.map((link) => (
          <SimpleGrid gap={2} w="full" p={3} bg="bg.one" columns={2} key={link.id}>
            <Tooltip label={link.link}>
              <Link href={link.link} target="_blank" isTruncated>
                {link.link}
              </Link>
            </Tooltip>
            <Flex justifyContent="flex-end">
              <HStack>
                <ActivationButton link={link} />
                <DeleteLinkModal link={link} />
              </HStack>
            </Flex>
          </SimpleGrid>
        ))}
      </VStack>
    );
  }

  return <EmptyState title="No Restricted Links" />;
};

const RestrictedWordsList = () => {
  const words = trpc.admin.restrictions.words.getAll.useQuery();

  if (words.isLoading) return <p>Loading...</p>;

  if (words.data) {
    return (
      <VStack>
        <Flex w="full">
          <AddNewWordForm />
        </Flex>
        {words.data.map((word) => (
          <SimpleGrid gap={2} w="full" p={3} bg="bg.one" columns={2} key={word.id}>
            <Text>{word.keyword}</Text>

            <Flex justifyContent="flex-end">
              <HStack>
                <WordActivationButton word={word} />
                <DeleteWordModal word={word} />
              </HStack>
            </Flex>
          </SimpleGrid>
        ))}
      </VStack>
    );
  }

  return <EmptyState title="No Restricted Links" />;
};

type ActivationButtonProps = {
  link: NonNullable<Singular<RouterOutput["admin"]["restrictions"]["links"]["getAll"]>>;
};
function ActivationButton({ link }: ActivationButtonProps) {
  const setStatusMutation = trpc.admin.restrictions.links.setStatus.useMutation();

  return (
    <div>
      {link.status ? (
        <Button
          size="sm"
          isLoading={setStatusMutation.isLoading}
          onClick={() =>
            setStatusMutation.mutate({
              id: link.id,
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
          size="sm"
          isLoading={setStatusMutation.isLoading}
          onClick={() =>
            setStatusMutation.mutate({
              id: link.id,
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

const AddNewLinkForm = () => {
  const primaryColorScheme = usePrimaryColorScheme();
  const toast = useToast();
  const createLinkMutation = trpc.admin.restrictions.links.create.useMutation();

  const schema = z.object({ link: z.string().url() });
  const { form, errors, reset } = useForm({
    onSubmit: (values) => {
      console.log(values);
      createLinkMutation.mutate(
        {
          ...schema.parse(values),
        },
        {
          onSuccess: () => {
            reset();
            toast({
              title: "Success",
              description: "Link has been added",
              status: "success",
              isClosable: true,
              position: "top-right",
            });
          },
        }
      );
    },
    extend: validator({ schema }),
    initialValues: {
      link: "",
    },
  });

  return (
    <form style={{ width: "100%" }} ref={form}>
      <InputGroup gap={2}>
        <FormControl isInvalid={!!errors().link} mb={4}>
          <Input name="link" placeholder="https://mylink.com" />
          {errors().link ? <FormErrorMessage>{errors().link}</FormErrorMessage> : null}
        </FormControl>
        <Button
          isLoading={createLinkMutation.isLoading}
          type="submit"
          px={6}
          leftIcon={<PlusCircle size={24} />}
          colorScheme={primaryColorScheme}
        >
          Add
        </Button>
      </InputGroup>
    </form>
  );
};

type DeleteRestrictedLinkModalProps = {
  link: NonNullable<Singular<RouterOutput["admin"]["restrictions"]["links"]["getAll"]>>;
};
const DeleteLinkModal = ({ link }: DeleteRestrictedLinkModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const toast = useToast();
  const deleteLink = trpc.admin.restrictions.links.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Link has been deleted",
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
              Delete Link
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You cannot undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={deleteLink.isLoading}
                colorScheme="red"
                onClick={() => deleteLink.mutate({ id: link.id })}
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

type WordActivationButtonProps = {
  word: NonNullable<Singular<RouterOutput["admin"]["restrictions"]["words"]["getAll"]>>;
};
function WordActivationButton({ word }: WordActivationButtonProps) {
  const setStatusMutation = trpc.admin.restrictions.words.setStatus.useMutation();

  return (
    <div>
      {word.status ? (
        <Button
          size="sm"
          isLoading={setStatusMutation.isLoading}
          onClick={() =>
            setStatusMutation.mutate({
              id: word.id,
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
          size="sm"
          isLoading={setStatusMutation.isLoading}
          onClick={() =>
            setStatusMutation.mutate({
              id: word.id,
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

const AddNewWordForm = () => {
  const primaryColorScheme = usePrimaryColorScheme();
  const toast = useToast();
  const createWordMutation = trpc.admin.restrictions.words.create.useMutation();

  const schema = z.object({ keyword: z.string().min(1) });
  const { form, errors, reset } = useForm({
    onSubmit: (values) => {
      console.log(values);
      createWordMutation.mutate(
        {
          ...schema.parse(values),
        },
        {
          onSuccess: () => {
            reset();
            toast({
              title: "Success",
              description: "Word has been added",
              status: "success",
              isClosable: true,
              position: "top-right",
            });
          },
        }
      );
    },
    extend: validator({ schema }),
    initialValues: {
      keyword: "",
    },
  });

  return (
    <form style={{ width: "100%" }} ref={form}>
      <InputGroup gap={2}>
        <FormControl isInvalid={!!errors().keyword} mb={4}>
          <Input name="keyword" placeholder="Add Word" />
          {errors().keyword ? <FormErrorMessage>{errors().keyword}</FormErrorMessage> : null}
        </FormControl>
        <Button
          isLoading={createWordMutation.isLoading}
          type="submit"
          px={6}
          leftIcon={<PlusCircle size={24} />}
          colorScheme={primaryColorScheme}
        >
          Add
        </Button>
      </InputGroup>
    </form>
  );
};

type DeleteRestrictedWordModalProps = {
  word: NonNullable<Singular<RouterOutput["admin"]["restrictions"]["words"]["getAll"]>>;
};
const DeleteWordModal = ({ word }: DeleteRestrictedWordModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const toast = useToast();
  const deleteLink = trpc.admin.restrictions.words.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word has been deleted",
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
              Delete Word
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You cannot undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={deleteLink.isLoading}
                colorScheme="red"
                onClick={() => deleteLink.mutate({ id: word.id })}
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

export default RestrictionsIndex;
