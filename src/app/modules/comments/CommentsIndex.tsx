import SaveChangesButton from "@app/components/SaveChangesButton";
import { IsAdmin, IsAuthor, IsNotAdmin, IsReader } from "@app/layout/AuthBlocks";
import {
  Avatar,
  Button,
  Center,
  Flex,
  GridItem,
  HStack,
  ModalFooter,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  Text,
  VStack,
  Wrap,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FormDialog, FormLayout, Loader, useModals } from "@saas-ui/react";
import { Book } from "phosphor-react";
import { useState } from "react";
import type { Singular } from "src/shared/types";
import { prettyDate } from "src/shared/utils";
import { z } from "zod";

import type { RouterInput, RouterOutput } from "@server/trpc/router";

const CommentsIndex = () => {
  return (
    <div>
      <IsAdmin>
        <Tabs isFitted>
          <TabList>
            <Tab>Needs Approval</Tab>
            <Tab>All Comments</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <BookComments type="allNeedsApproval" />
            </TabPanel>
            <TabPanel>
              <BookComments type="all" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </IsAdmin>
      <IsNotAdmin>
        <IsAuthor>
          <Tabs isFitted>
            <TabList>
              <Tab>Book Comments</Tab>
              <Tab>Your Comments</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <BookComments type="book" />
              </TabPanel>
              <TabPanel>
                <BookComments type="my" />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </IsAuthor>
        <IsReader>
          <Tabs isFitted>
            <TabList>
              <Tab>Your Comments</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <BookComments type="my" />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </IsReader>
      </IsNotAdmin>
    </div>
  );
};

type BookCommentsProps = {
  type: RouterInput["comments"]["getBookComments"]["type"];
};
const BookComments = ({ type }: BookCommentsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const comments = trpc.comments.getBookComments.useQuery({
    page: currentPage,
    pageSize: 10,
    type: type,
  });
  if (comments.isLoading) return <Loader />;

  if (comments.data) {
    return (
      <div>
        <div className="flex flex-col gap-2">
          {comments.data.bookComments.map((comment) => (
            <CommentRow key={comment.commentKey} type={type} comment={comment} />
          ))}
        </div>
        <div>
          {comments.data.bookComments.length > 0 && comments.data.pagination.totalPages > 1 && (
            <Center mt={2} gap={2}>
              <Button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(1);
                }}
              >
                First
              </Button>
              <Button
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(Math.max(currentPage - 1, 1));
                }}
              >
                Previous
              </Button>

              <Button>{currentPage}</Button>

              <Button
                disabled={currentPage === comments.data.pagination.totalPages}
                onClick={() => {
                  setCurrentPage(Math.min(currentPage + 1, comments.data.pagination.totalPages));
                }}
              >
                Next
              </Button>
              <Button
                disabled={currentPage === comments.data.pagination.totalPages}
                onClick={() => {
                  setCurrentPage(comments.data.pagination.totalPages);
                }}
              >
                {comments.data.pagination.totalPages}
              </Button>
            </Center>
          )}
        </div>
      </div>
    );
  }
  return <p>Nothing here</p>;
};

type CommentRowProps = {
  comment: Singular<RouterOutput["comments"]["getBookComments"]["bookComments"]>;
  type: RouterInput["comments"]["getBookComments"]["type"];
};

function CommentRow({ comment, type }: CommentRowProps) {
  const commentReply = trpc.comments.getReply.useQuery({ commentId: comment.commentKey });

  const ReplyBox = () =>
    commentReply.data ? (
      <GridItem colSpan={2}>
        <Flex
          gap={3}
          alignItems="center"
          justifyContent="space-between"
          p={2}
          className="border rounded-md"
        >
          <Text>{commentReply.data.comment}</Text>
          <DeleteCommentModal commentId={commentReply.data.id} />
        </Flex>
      </GridItem>
    ) : null;
  return (
    <div>
      <SimpleGrid
        p={3}
        className="bg-base-300"
        key={`comment-${comment.commentKey}`}
        columns={{ base: 1, lg: 2 }}
        gap={3}
        position="relative"
        shadow="md"
        rounded="md"
      >
        <GridItem colSpan={2}>
          <Wrap mb={2}>
            {comment.approve ? (
              <Tag size="sm" colorScheme="green" borderRadius="full" variant="solid">
                <TagLabel>Approved</TagLabel>
              </Tag>
            ) : (
              <Tag size="sm" colorScheme="red" borderRadius="full" variant="solid">
                <TagLabel>Not Approved</TagLabel>
              </Tag>
            )}
            <Tag
              as="a"
              href={`/book/${comment.book_id}`}
              target="_blank"
              size="sm"
              colorScheme="blue"
              borderRadius="full"
            >
              <Avatar
                src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/uploads/${comment.book_cover}/Thumbnail`}
                icon={<Book color="black" size={20} />}
                bg="none"
                size="xs"
                ml={-1}
                mr={2}
              />
              <TagLabel>{comment.title}</TagLabel>
            </Tag>
            <Tag
              as="a"
              href={`/book/${comment.book_id}/chapter/${comment.chapter_id}#commentSection`}
              target="_blank"
              size="sm"
              colorScheme="green"
              borderRadius="full"
            >
              <Avatar
                src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/uploads/${comment.book_cover}/Thumbnail`}
                icon={<Book color="black" size={20} />}
                bg="none"
                size="xs"
                ml={-1}
                mr={2}
              />
              <TagLabel>Chapter: {comment.chapterTitle}</TagLabel>
            </Tag>
          </Wrap>
        </GridItem>
        <VStack alignItems="flex-start" justifyContent="flex-start">
          <HStack>
            <Avatar
              src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/avatars/${comment.avatar}/Thumbnail`}
              name={comment.user_name}
            />

            <VStack spacing="5px" alignItems="flex-start">
              <HStack>
                <Text fontWeight="bold">{comment.user_name}</Text>
                {comment.created_at && (
                  <Text fontSize="xs" color="textMuted">
                    {prettyDate(comment.created_at)}
                  </Text>
                )}
              </HStack>
              <Text fontSize="sm">{comment.comment}</Text>
            </VStack>
          </HStack>
        </VStack>

        <GridItem colSpan={{ base: 2, lg: 1 }}>
          <Flex gap={2} justifyContent="flex-end" alignItems="center">
            {commentReply.data ? null : commentReply.isLoading ? (
              <Loader />
            ) : type === "my" ? (
              <DeleteCommentModal commentId={comment.commentKey} />
            ) : (
              <ReplyForm comment={comment} />
            )}
            <IsAdmin>
              <ApproveButton comment={comment} />
            </IsAdmin>
          </Flex>
        </GridItem>
        <ReplyBox />
      </SimpleGrid>
    </div>
  );
}

type ApproveButtonProps = {
  comment: Singular<RouterOutput["comments"]["getBookComments"]["bookComments"]>;
};

function ApproveButton({ comment }: ApproveButtonProps) {
  const setApprovalMutation = trpc.comments.setApproval.useMutation();
  return (
    <>
      {comment.approve ? (
        <Button
          isLoading={setApprovalMutation.isLoading}
          onClick={() => setApprovalMutation.mutate({ commentId: comment.commentKey, approval: 0 })}
          size="sm"
          colorScheme="red"
        >
          Suspend
        </Button>
      ) : (
        <Button
          isLoading={setApprovalMutation.isLoading}
          onClick={() => setApprovalMutation.mutate({ commentId: comment.commentKey, approval: 1 })}
          size="sm"
          colorScheme="green"
        >
          Approve
        </Button>
      )}
    </>
  );
}

type ReplyFormProps = {
  comment: Singular<RouterOutput["comments"]["getBookComments"]["bookComments"]>;
};

function ReplyForm({ comment }: ReplyFormProps) {
  const toast = useToast();
  const disclosure = useDisclosure();
  const replyMutation = trpc.comments.reply.useMutation();

  const schema = z.object({
    reply: z.string().min(1),
  });
  type ReplyFormFields = z.infer<typeof schema>;

  const onSubmit = async (data: ReplyFormFields) => {
    console.log({ data });
    replyMutation.mutate(
      { commentId: comment.commentKey, reply: data.reply },
      {
        onSuccess: (data) => {
          toast({
            title: "Success",
            description: data.successMessage,
            status: "success",
            isClosable: true,
            position: "top-right",
          });
          disclosure.onClose();
        },
      }
    );
  };

  const footer = (
    <ModalFooter>
      <SaveChangesButton isLoading={replyMutation.isLoading} text="Submit" />
    </ModalFooter>
  );

  return (
    <>
      <Button size="sm" colorScheme="blue" aria-label="reply" onClick={() => disclosure.onOpen()}>
        Reply
      </Button>
      <FormDialog
        title={`Reply to ${comment.user_name}`}
        defaultValues={{ reply: "" }}
        {...disclosure}
        onSubmit={onSubmit}
        resolver={zodResolver(schema)}
        footer={footer}
      >
        <FormLayout>
          <Field autoFocus name="reply" type="textarea" label="Message" />
        </FormLayout>
      </FormDialog>
    </>
  );
}

type DeleteCommentModalProps = {
  commentId: number;
};

function DeleteCommentModal({ commentId }: DeleteCommentModalProps) {
  const modals = useModals();
  const deleteMutation = trpc.comments.delete.useMutation();

  return (
    <Button
      size="sm"
      isLoading={deleteMutation.isLoading}
      loadingText="Deleting..."
      colorScheme="red"
      onClick={() =>
        modals.confirm({
          title: "Delete Comment",
          body: "Are you sure you want to delete this comment?",
          confirmProps: {
            colorScheme: "red",
            label: "Delete",
          },
          onConfirm: () => {
            deleteMutation.mutate({ commentId: commentId });
          }, // action
        })
      }
    >
      Delete
    </Button>
  );
}

export default CommentsIndex;
