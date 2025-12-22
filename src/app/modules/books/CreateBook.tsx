import { Button, Center, Container, Flex, Heading, Input, Text, Wrap } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowCircleRight } from "phosphor-react";
import { useState } from "react";
import { usePrimaryColor, usePrimaryColorScheme } from "src/app/theme";
import { genres } from "src/shared/constants";
import { z } from "zod";

import type { RouterInput } from "@server/trpc/router";

import { createBooksRoute } from "./routes";

const CreateBook = () => {
  const navigate = useNavigate({ from: createBooksRoute.id });
  const createBook = trpc.author.createBook.useMutation();
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const primaryColorScheme = usePrimaryColorScheme();
  const primaryColor = usePrimaryColor();

  const schema = z.object({
    title: z.string().min(2, "Your title is too short"),
    genre: z.string().min(2, "Please choose a genre"),
  });

  const { form, errors, setFields } = useForm<z.infer<typeof schema>>({
    onSubmit(values) {
      createBook.mutate(
        {
          title: values.title,
          genre: values.genre as RouterInput["author"]["createBook"]["genre"],
        },
        {
          onSuccess: (book) => {
            navigate({ to: "/app/books/$bookId", params: { bookId: book.id.toString() } });
          },
        }
      );
    },
    extend: validator({ schema }),
    initialValues: {
      title: "",
      genre: "",
    },
  });

  return (
    <Container maxW="xl">
      <form ref={form}>
        <Center flexDirection="column">
          <Heading>What is the title of your book?</Heading>
          <Heading> {JSON.stringify(errors)}</Heading>

          <Flex direction="column" alignItems="center" my={8} w="full">
            <Text mb={2} color="textDanger">
              {errors().title}
            </Text>
            <Input
              name="title"
              p={6}
              placeholder="The most amazing book"
              size="lg"
              rounded="full"
              variant="filled"
              focusBorderColor={primaryColor}
            />
          </Flex>
          <Text mb={2} fontWeight="bold">
            What is the Genre of your book?
          </Text>
          <Text color="textDanger" mb={2}>
            {errors().genre}
          </Text>
          <Wrap w="full" justify="center" gap={2}>
            {genres.map((genre) => (
              <Button
                key={`button-${genre}`}
                onClick={() => {
                  setSelectedGenre(genre);
                  setFields("genre", genre);
                }}
                p={3}
                bg={selectedGenre === genre ? "primary" : "bg.two"}
                colorScheme={selectedGenre === genre ? primaryColorScheme : undefined}
              >
                {genre}
              </Button>
            ))}
          </Wrap>

          <Flex w="full" justifyContent="flex-end">
            <Button
              type="submit"
              p={6}
              mt={10}
              colorScheme={primaryColorScheme}
              bg={"primary"}
              rightIcon={<ArrowCircleRight size={25} weight="fill" />}
              isLoading={createBook.isLoading}
            >
              Ready for Authoring!
            </Button>
          </Flex>
        </Center>
      </form>
    </Container>
  );
};

export default CreateBook;
