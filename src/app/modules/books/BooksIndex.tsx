import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AspectRatio,
  Badge,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Show,
  Spacer,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { manualTrpc, trpc } from "@client/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ArrowDown, ArrowUp } from "phosphor-react";
import React, { useState } from "react";
import EmptyState from "src/app/components/EmptyState";
import type { Singular } from "src/shared/types";
import { bookCoverThumbnail } from "src/shared/utils";

import type { RouterOutput } from "@server/trpc/router";

dayjs.extend(localizedFormat);

const BooksIndex = () => {
  const published = trpc.author.getBooks.useQuery({ type: "book" });
  const trashed = trpc.author.getTrashedBooks.useQuery();
  const drafts = trpc.author.getBooks.useQuery({ type: "draft" });
  const primaryColorScheme = useColorModeValue("ocean", "fire");

  if (published.isLoading) return <div>Loading...</div>;
  if (!published.data && !drafts.data && !trashed.data) {
    return (
      <Box display="flex" alignItems="center" pt={20} gap={8} flexDirection="column" minH="full">
        <Image rounded="lg" w="md" src="/screenwriter.jpg" />
        <Heading>No Books</Heading>
        <Text>You have not created any books yet. Create one now!</Text>
        <Link to="/app/books/create">
          <Button
            _hover={{ bg: "primaryHighlight" }}
            bg="primary"
            color="primaryText"
            px={10}
            py={7}
          >
            Create Book
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Stack spacing={10}>
      <Flex justifyContent="space-between">
        <Heading>Books</Heading>
        <Link to="/app/books/create">
          <Button colorScheme="primary" bg="primary" _hover={{ background: "primaryHighlight" }}>
            Create Book
          </Button>
        </Link>
      </Flex>
      <Tabs colorScheme={primaryColorScheme} isFitted>
        <TabList fontWeight="bold">
          <Tab>Published</Tab>
          <Tab>Drafts</Tab>
          <Tab>Trash</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {published.data && published.data.length > 0 ? (
              <BookList books={published.data} />
            ) : (
              <EmptyState title={"No Published Books"} />
            )}
          </TabPanel>
          <TabPanel>
            {drafts.data && drafts.data.length > 0 ? (
              <BookList books={drafts.data} />
            ) : (
              <EmptyState title={"No Draft Books"} />
            )}
          </TabPanel>
          <TabPanel>
            {trashed.data && trashed.data.length > 0 ? (
              <BookList books={trashed.data} />
            ) : (
              <EmptyState title={"No Trashed Books"} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

type BookListProps = {
  books: RouterOutput["author"]["getBooks"];
};

const BookList = ({ books }: BookListProps) => {
  const animationParent = useAutoAnimate();

  return (
    <Stack ref={animationParent}>
      {books.map((book) => (
        <BookRow
          key={`book-list-item-${book.id}-${book.status}-${book.deleted_at?.toDateString() ?? ""}`}
          book={book}
          books={books}
        />
      ))}
    </Stack>
  );
};

type BookRowProps = {
  books: RouterOutput["author"]["getBooks"];
  book: Singular<RouterOutput["author"]["getBooks"]>;
};
const BookRow = ({ book, books }: BookRowProps) => {
  const toast = useToast({
    containerStyle: {
      width: "lg",
      maxWidth: "90%",
    },
  });
  const moveToDrafts = trpc.author.moveToDrafts.useMutation();
  const moveToPublished = trpc.author.moveToPublished.useMutation();
  const moveToTrash = trpc.author.moveToTrash.useMutation();
  const moveToRestore = trpc.author.moveToRestore.useMutation();
  const utils = trpc.useContext();
  const updateBookOrderMutation = manualTrpc.author.updateBookOrdering.useMutation({
    onMutate: (data) => {
      utils.author.getBooks.cancel({ type: "book" });
      utils.author.getBooks.setData({ type: "book" }, data);
    },
  });

  return (
    <Flex
      position="relative"
      key={book.id}
      direction={{ base: "column", lg: "row" }}
      shadow="sm"
      bg="bg.one"
      borderRadius="md"
      p={4}
      gap={4}
      alignItems="center"
    >
      <Box w={{ base: "100px", lg: "100px" }}>
        <AspectRatio maxW="sm" w="full" ratio={4.25 / 6}>
          <Image
            src={bookCoverThumbnail(book.book_cover)}
            fallbackSrc={`/api/fallback/${book.id}`}
          />
        </AspectRatio>
      </Box>
      <VStack w="full" spacing={3} alignItems={{ base: "center", lg: "flex-start" }}>
        <Box>
          <Text textAlign={{ base: "center", lg: "start" }} fontSize="lg" fontWeight="bold">
            {book.title}
          </Text>
          <Text textAlign={{ base: "center", lg: "start" }} fontSize="sm" color="textMuted">
            {dayjs(book.created_at).format("LLL")}
          </Text>
        </Box>
        {book.genre && (
          <Badge
            colorScheme={"green"}
            color="textPrimary"

            // bg={randomColor({
            //   string: book.genre,
            //   colors: ["#d9ed92", "#b5e48c", "#99d98c", "#76c893", "#52b69a", "#34a0a4", "#168aad"],
            // })}
          >
            <Text fontWeight="bold">{book.genre}</Text>
          </Badge>
        )}
        <Spacer />
        <Show below="lg">
          {book.status === "1" && !book.deleted_at ? (
            <HStack>
              <IconButton
                onClick={() => {
                  const newBooks = moveObjectInArray(books, book.id, "backward");
                  updateBookOrderMutation.mutate(newBooks);
                  console.log(newBooks);
                }}
                aria-label="move up"
                icon={<ArrowUp />}
              />
              <IconButton
                onClick={() => {
                  const newBooks = moveObjectInArray(books, book.id, "forward");
                  updateBookOrderMutation.mutate(newBooks);
                  console.log(newBooks);
                }}
                aria-label="move down"
                icon={<ArrowDown />}
              />
            </HStack>
          ) : null}
        </Show>
        <Flex direction="row" w="full" justify={{ base: "center", lg: "flex-end" }} gap={2}>
          <Show above="lg">
            {book.status === "1" && !book.deleted_at ? (
              <HStack>
                <IconButton
                  size="sm"
                  onClick={() => {
                    const newBooks = moveObjectInArray(books, book.id, "backward");
                    updateBookOrderMutation.mutate(newBooks);
                    console.log(newBooks);
                  }}
                  aria-label="move up"
                  icon={<ArrowUp />}
                />
                <IconButton
                  size="sm"
                  onClick={() => {
                    const newBooks = moveObjectInArray(books, book.id, "forward");
                    updateBookOrderMutation.mutate(newBooks);
                    console.log(newBooks);
                  }}
                  aria-label="move down"
                  icon={<ArrowDown />}
                />
              </HStack>
            ) : null}
          </Show>
          <Link to="/app/books/$bookId" params={{ bookId: book.id.toString() }}>
            <Button size="sm" w="full">
              View Book
            </Button>
          </Link>
          {book.status === "1" && !book.deleted_at ? (
            <>
              <Button
                size="sm"
                onClick={() =>
                  moveToDrafts.mutate(
                    { bookId: book.id },
                    {
                      onSuccess: () =>
                        toast({
                          title: "Success",
                          description: `${book.title} has been moved to drafts succesfully`,
                          status: "success",
                          isClosable: true,
                        }),
                    }
                  )
                }
                isLoading={moveToDrafts.isLoading}
                colorScheme={"blue"}
              >
                Move to Drafts
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  moveToTrash.mutate(
                    { bookId: book.id },
                    {
                      onSuccess: () =>
                        toast({
                          title: "Success",
                          description: `${book.title} has been moved to trash succesfully`,
                          status: "success",
                          isClosable: true,
                        }),
                    }
                  )
                }
                isLoading={moveToTrash.isLoading}
                colorScheme={"red"}
              >
                Trash
              </Button>
            </>
          ) : null}
          {book.status === "0" && !book.deleted_at ? (
            <>
              <Button
                size="sm"
                onClick={() =>
                  moveToPublished.mutate(
                    { bookId: book.id },
                    {
                      onSuccess: () =>
                        toast({
                          title: "Success",
                          description: `${book.title} has been published succesfully`,
                          status: "success",
                          isClosable: true,
                        }),
                    }
                  )
                }
                isLoading={moveToPublished.isLoading}
                colorScheme={"green"}
              >
                Publish
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  moveToTrash.mutate(
                    { bookId: book.id },
                    {
                      onSuccess: () =>
                        toast({
                          title: "Success",
                          description: `${book.title} has been moved to trash succesfully`,
                          status: "success",
                          isClosable: true,
                        }),
                    }
                  )
                }
                isLoading={moveToTrash.isLoading}
                colorScheme={"red"}
              >
                Trash
              </Button>
            </>
          ) : null}
          {book.deleted_at ? (
            <>
              <Button
                size="sm"
                onClick={() =>
                  moveToRestore.mutate(
                    { bookId: book.id },
                    {
                      onSuccess: () =>
                        toast({
                          title: "Success",
                          description: `${book.title} has been restored succesfully`,
                          status: "success",
                          isClosable: true,
                        }),
                    }
                  )
                }
                isLoading={moveToRestore.isLoading}
                colorScheme={"blue"}
              >
                Restore
              </Button>
              <DeleteBookModal book={book} />
            </>
          ) : null}
        </Flex>
      </VStack>
    </Flex>
  );
};

type DeleteBookModalProps = {
  book: Singular<RouterOutput["author"]["getBooks"]>;
};
const DeleteBookModal = ({ book }: DeleteBookModalProps) => {
  const toast = useToast({
    containerStyle: {
      width: "lg",
      maxWidth: "90%",
    },
  });
  const deletePermanently = trpc.author.deletePermanently.useMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const [confirmTitle, setConfirmTitle] = useState("");

  return (
    <>
      <Button size="sm" colorScheme="red" onClick={onOpen}>
        Delete Book
      </Button>

      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Book
            </AlertDialogHeader>

            <AlertDialogBody>
              <Alert my={3} status="error">
                <AlertIcon />
                {deletePermanently.error?.message
                  ? "Oops. Something went wrong"
                  : "This action cannot be undone!"}
              </Alert>
              <Text my={2}>
                Are you sure you want to delete <strong>{book.title}</strong> and all of its
                chapters?
              </Text>
              <Input
                value={confirmTitle}
                onChange={(e) => setConfirmTitle(e.target.value)}
                placeholder="Enter the Title of the book"
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                isDisabled={confirmTitle !== book.title}
                isLoading={deletePermanently.isLoading}
                colorScheme="red"
                onClick={() => {
                  deletePermanently.mutate(
                    { bookId: book.id },
                    {
                      onSuccess: () => {
                        toast({
                          title: "Success",
                          description: `${book.title} has been deleted succesfully`,
                          status: "success",
                          isClosable: true,
                        });
                        onClose();
                      },
                    }
                  );
                }}
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

function moveObjectInArray<T extends { id: number }>(
  array: T[],
  id: number,
  direction: "forward" | "backward"
): T[] {
  const index = array.findIndex((item) => item["id"] === id);
  if (index === -1) {
    throw new Error("Object not found in array");
  }
  const newIndex = direction === "forward" ? index + 1 : index - 1;
  if (newIndex < 0 || newIndex >= array.length) {
    throw new Error("Cannot move object out of bounds of array");
  }
  const newArray = [...array];
  const [item] = newArray.splice(index, 1);
  newArray.splice(newIndex, 0, item);
  return newArray;
}

export default BooksIndex;
