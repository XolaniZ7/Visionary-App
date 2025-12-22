import {
  Alert,
  AlertIcon,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { useModals } from "@saas-ui/react";
import { useParams } from "@tanstack/react-router";
import { ArrowCircleRight } from "phosphor-react";
import { useState } from "react";
import TipTap from "src/app/components/TipTap";
import { usePrimaryColorScheme } from "src/app/theme";
import { z } from "zod";

import type { RouterOutput } from "@server/trpc/router";

import { editChaptersRoute } from "./routes";

const schema = z.object({
  title: z.string().min(1, "You forgot to add a title it seems"),
  content: z.string().min(10, "You forgot to write your chapter"),
});

const EditChapterWrapper = () => {
  const params = useParams({ from: editChaptersRoute.id });
  const chapterId = z.coerce.number().parse(params.chapterId);
  const chapter = trpc.author.chapters.get.useQuery({ chapterId });

  if (chapter.isLoading) return <p>Loading</p>;
  if (chapter.data) return <EditChapter chapter={chapter.data} />;
  return <p>404</p>;
};

type EditChapterProps = {
  chapter: NonNullable<RouterOutput["author"]["chapters"]["get"]>;
};
const EditChapter = ({ chapter }: EditChapterProps) => {
  const toast = useToast();
  const editChapterMutation = trpc.author.chapters.edit.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chapter Updated Sucessfully",
        status: "success",
        position: "top-right",
        isClosable: true,
      });
    },
  });
  const primaryColorScheme = usePrimaryColorScheme();
  const [chapterText, setChapterText] = useState(chapter.chapter_content);
  const trashChapterMutation = trpc.author.chapters.moveToTrash.useMutation();
  const publishChapterMutation = trpc.author.chapters.moveToPublish.useMutation();
  const moveChaptertoDraftMutation = trpc.author.chapters.moveToDraft.useMutation();
  const modals = useModals();

  const { form, errors, setFields } = useForm<z.infer<typeof schema>>({
    onSubmit: (values) => {
      editChapterMutation.mutate({
        chapterId: chapter.id,
        title: values.title,
        content: values.content,
      });
    },
    extend: validator({ schema }),
    initialValues: {
      title: chapter.title,
      content: chapter.chapter_content,
    },
  });

  return (
    <Container maxW="container.lg">
      <Flex mb={8} justifyContent="space-between" alignItems="center">
        <Heading>Edit Chapter</Heading>

        <HStack>
          {!chapter.deleted_at ? (
            <>
              {chapter.status === true ? (
                <Button
                  isDisabled={
                    chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
                  }
                  isLoading={moveChaptertoDraftMutation.isLoading}
                  onClick={() => {
                    modals.confirm({
                      title: "Publish Chapter",
                      body: "Are you sure you want to move this chapter to drafts? It will be hidden to readers.",
                      confirmProps: {
                        colorScheme: "blue",
                        label: "Move to Drafts",
                      },
                      onConfirm: () => {
                        moveChaptertoDraftMutation.mutate(
                          { chapterId: chapter.id },
                          {
                            onSuccess: () => {
                              toast({
                                title: "Success",
                                description: "Chapter Moved to Drafts Sucessfully",
                                status: "success",
                                position: "top-right",
                                isClosable: true,
                              });
                            },
                          }
                        );
                      }, // action
                    });
                  }}
                  colorScheme="blue"
                >
                  Move to Drafts
                </Button>
              ) : (
                <Button
                  isDisabled={
                    chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
                  }
                  isLoading={publishChapterMutation.isLoading}
                  onClick={() => {
                    modals.confirm({
                      title: "Publish Chapter",
                      body: "Are you sure you want to publish this chapter?",
                      confirmProps: {
                        colorScheme: "green",
                        label: "Publish",
                      },
                      onConfirm: () => {
                        publishChapterMutation.mutate(
                          { chapterId: chapter.id },
                          {
                            onSuccess: () => {
                              toast({
                                title: "Success",
                                description: "Chapter Published Sucessfully",
                                status: "success",
                                position: "top-right",
                                isClosable: true,
                              });
                            },
                          }
                        );
                      }, // action
                    });
                  }}
                  colorScheme="green"
                >
                  Publish
                </Button>
              )}
              <Button
                isLoading={trashChapterMutation.isLoading}
                isDisabled={
                  chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
                }
                onClick={() => {
                  modals.confirm({
                    title: "Delete Chapter",
                    body: "Are you sure you want to delete this chapter?",
                    confirmProps: {
                      colorScheme: "red",
                      label: "Delete",
                    },
                    onConfirm: () => {
                      trashChapterMutation.mutate(
                        { chapterId: chapter.id },
                        {
                          onSuccess: () => {
                            toast({
                              title: "Success",
                              description: "Chapter Deleted Sucessfully",
                              status: "success",
                              position: "top-right",
                              isClosable: true,
                            });
                          },
                        }
                      );
                    }, // action
                  });
                }}
                variant="ghost"
                colorScheme="red"
              >
                Trash
              </Button>
            </>
          ) : (
            <Button
              isDisabled={
                chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
              }
              isLoading={moveChaptertoDraftMutation.isLoading}
              onClick={() => {
                modals.confirm({
                  title: "Restore Chapter",
                  body: "Are you sure you want to restore this chapter? It will be moved to drafts",
                  confirmProps: {
                    colorScheme: "red",
                    label: "Restore Chapter",
                  },
                  onConfirm: () => {
                    moveChaptertoDraftMutation.mutate(
                      { chapterId: chapter.id },
                      {
                        onSuccess: () => {
                          toast({
                            title: "Success",
                            description: "Chapter Restored Sucessfully",
                            status: "success",
                            position: "top-right",
                            isClosable: true,
                          });
                        },
                      }
                    );
                  }, // action
                });
              }}
              variant="ghost"
              colorScheme="red"
            >
              Remove from trash
            </Button>
          )}
        </HStack>
      </Flex>
      {chapter.deleted_at ? (
        <Alert my={4} status="error">
          <AlertIcon />
          This chapter is currently unavailable to all readers as it has been moved to the trash.
        </Alert>
      ) : !chapter.status ? (
        <Alert my={4} status="warning">
          <AlertIcon />
          This chapter is not accessible to readers as it is still in draft mode.
        </Alert>
      ) : (
        <Alert my={4} status="success">
          <AlertIcon />
          <Stack>
            <p>This chapter is public and accessible to all readers.</p>
            <a
              target="_blank"
              rel="noreferrer"
              href={`/book/${chapter.book_id}/chapter/${chapter.id}`}
              className="link mx-2 block"
            >
              View Chapter
            </a>
          </Stack>
        </Alert>
      )}
      <form ref={form}>
        <FormControl isInvalid={!!errors().title} mb={4}>
          <FormLabel fontWeight="bold">Chapter Title</FormLabel>
          <Input
            isDisabled={
              chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
            }
            name="title"
            variant="outline"
            bg="inputBg"
          />
          {errors().title ? <FormErrorMessage>{errors().title}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={!!errors().content} mb={4}>
          <TipTap
            isDisabled={
              chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
            }
            value={chapterText}
            onChange={(value) => {
              setChapterText(value);
              setFields("content", value);
            }}
          />
          {errors().content ? <FormErrorMessage>{errors().content}</FormErrorMessage> : null}
        </FormControl>
        <Flex w="full" justifyContent="flex-end">
          <Button
            isDisabled={
              chapter.book.exclusiveStatus === "Exclusive" && chapter.book.user.admin !== true
            }
            type="submit"
            p={6}
            colorScheme={primaryColorScheme}
            bg={"primary"}
            mt={10}
            rightIcon={<ArrowCircleRight size={25} weight="fill" />}
            isLoading={editChapterMutation.isLoading}
          >
            Submit
          </Button>
        </Flex>
      </form>
    </Container>
  );
};

export default EditChapterWrapper;
