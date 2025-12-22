import {
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { useMatch, useNavigate } from "@tanstack/react-router";
import { ArrowCircleRight } from "phosphor-react";
import { useState } from "react";
import TipTap from "src/app/components/TipTap";
import { usePrimaryColorScheme } from "src/app/theme";
import { z } from "zod";

import { createChaptersRoute } from "./routes";

const schema = z.object({
  title: z.string().min(1, "You forgot to add a title it seems"),
  content: z.string().min(1, "You forgot to write your chapter"),
});

const CreateChapter = () => {
  const { params } = useMatch({ from: createChaptersRoute.id });
  const navigate = useNavigate();
  const toast = useToast();
  const bookId = z.coerce.number().parse(params.bookId);
  const createChapterMutation = trpc.author.chapters.create.useMutation();
  const primaryColorScheme = usePrimaryColorScheme();
  const [chapterText, setChapterText] = useState("");

  const { form, errors, setFields } = useForm<z.infer<typeof schema>>({
    onSubmit: (values) => {
      createChapterMutation.mutate(
        {
          bookId,
          title: values.title,
          content: values.content,
        },
        {
          onSuccess: (data) => {
            toast({
              title: "Success",
              description: "Chapter Created Sucessfully",
              status: "success",
              position: "top-right",
              isClosable: true,
            });
            navigate({
              to: "/app/books/$bookId/chapters/$chapterId",
              params: { bookId: params.bookId, chapterId: data.id.toString() },
            });
          },
        }
      );
    },
    extend: validator({ schema }),
    initialValues: {
      title: "",
      content: "",
    },
  });

  return (
    <Container maxW="container.lg">
      <Heading mb={8}>Create Chapter</Heading>
      <form ref={form}>
        <FormControl isInvalid={!!errors().title} mb={4}>
          <FormLabel fontWeight="bold">Chapter Title</FormLabel>
          <Input name="title" variant="outline" bg="inputBg" />
          {errors().title ? <FormErrorMessage>{errors().title}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={!!errors().content} mb={4}>
          <TipTap
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
            type="submit"
            p={6}
            colorScheme={primaryColorScheme}
            bg={"primary"}
            mt={10}
            rightIcon={<ArrowCircleRight size={25} weight="fill" />}
            isLoading={createChapterMutation.isLoading}
          >
            Submit
          </Button>
        </Flex>
      </form>
    </Container>
  );
};

export default CreateChapter;
