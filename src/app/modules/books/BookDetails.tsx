import {
  Alert,
  AlertIcon,
  AspectRatio,
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  GridItem,
  HStack,
  Heading,
  Image,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  Wrap,
  useBoolean,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { Card, CardBody, CardHeader, useModals } from "@saas-ui/react";
import { useMatch, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowCircleRight, PlusCircle } from "phosphor-react";
import { useState } from "react";
import Tiptap from "src/app/components/TipTap";
import { usePrimaryColorScheme } from "src/app/theme";
import { genres } from "src/shared/constants";
import { bookCoverUrl } from "src/shared/utils";
import { z } from "zod";

import type { RouterInput, RouterOutput } from "@server/trpc/router";

import ImageUploadWidget from "../../components/ImageUploadWidget";
import { bookDetailsIndexRoute, bookDetailsRoute } from "./routes";

const BookDetails = () => {
  const { params } = useMatch({ from: bookDetailsIndexRoute.id });
  const bookId = z.coerce.number().parse(params.bookId);

  const bookQuery = trpc.author.getBook.useQuery({ bookId: bookId });

  if (bookQuery.isLoading) return <p>Loading</p>;
  if (bookQuery.data) {
    return (
      <Container maxW="container.xl">
        <BookSection book={bookQuery.data} />
      </Container>
    );
  }
};

type BookDetailsProps = {
  book: NonNullable<RouterOutput["author"]["getBook"]>;
};
const BookSection = ({ book }: BookDetailsProps) => {
  const toast = useToast();
  const modals = useModals();
  const updateBookCoverMutation = trpc.author.updateBookCover.useMutation();
  const markAsCompleteMutation = trpc.author.markAsComplete.useMutation();
  const requestExclusiveMutation = trpc.author.requestExclusive.useMutation();
  const confirmExclusiveMutation = trpc.author.confirmExclusive.useMutation();

  const user = trpc.getCurrentUser.useQuery();
  const premiumBooksViews = trpc.author.getSubscribedViews.useQuery({ bookId: book.id });

  //const markAsNotCompleteMutation = trpc.author.markAsNotComplete.useMutation();
  const updateBookMutation = trpc.author.updateBook.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book Updated Sucessfully",
        status: "success",
        position: "top-right",
        isClosable: true,
      });
    },
  });
  const [removeImageState, updateRemoveImageState] = useBoolean(false);
  const [, setNewDescription] = useState(book.description ?? "");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(book.genre ?? "");
  const primaryColorScheme = usePrimaryColorScheme();

  const schema = z.object({
    title: z.string().min(2, "Your title is too short"),
    genre: z.string().min(2, "Please choose a genre"),
    description: z.string(),
  });

  const { form, errors, setFields, handleSubmit } = useForm<z.infer<typeof schema>>({
    onSubmit(values) {
      console.log({ values });
      updateBookMutation.mutate({
        id: book.id,
        title: values.title,
        description: values.description,
        genre: values.genre as RouterInput["author"]["updateBook"]["genre"],
      });
    },
    extend: validator({ schema }),
    initialValues: {
      title: book.title ?? "",
      genre: book.genre ?? "",
      description: book.description ?? "",
    },
  });

  return (
    <>
      <Flex mb={5} w="full" justifyContent="space-between" alignItems="center">
        <Heading>Edit Book</Heading>
        <HStack>
          <Button type="submit" as="a" target="_blank" href={`/book/${book.id}`} variant="ghost">
            View Book
          </Button>
          <Button
            isDisabled={book.exclusiveStatus === "Exclusive" && user.data?.admin !== true}
            type="submit"
            onClick={() => handleSubmit()}
            p={6}
            mt={2}
            colorScheme={primaryColorScheme}
            bg={"primary"}
            rightIcon={<ArrowCircleRight size={25} weight="fill" />}
            isLoading={updateBookMutation.isLoading}
          >
            Save Changes
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid gap={{ base: 0, lg: 5 }} rowGap={5} columns={{ base: 1, lg: 4 }}>
        <GridItem>
          <Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={3}
              p={3}
              rounded="2xl"
              backgroundColor="bg.card"
            >
              <Box w="full">
                <AspectRatio w="full" ratio={4.25 / 6}>
                  <Image
                    src={bookCoverUrl(book.book_cover)}
                    fallbackSrc={`/api/fallback/${book.id}`}
                  />
                </AspectRatio>
              </Box>
              {book.exclusiveStatus === "Exclusive" &&
              user.data?.admin !== true ? null : removeImageState ? (
                <Button
                  isLoading={updateBookCoverMutation.isLoading}
                  onClick={() => {
                    if (book) {
                      updateBookCoverMutation.mutate(
                        { bookId: book.id, coverId: "" },
                        {
                          onSettled: () => {
                            updateRemoveImageState.off();
                          },
                        }
                      );
                    }
                  }}
                  variant="solid"
                  colorScheme="red"
                >
                  Are you sure?
                </Button>
              ) : (
                <Button onClick={() => updateRemoveImageState.on()} variant="ghost">
                  Remove Image
                </Button>
              )}
              {book.exclusiveStatus === "Exclusive" && user.data?.admin !== true ? null : (
                <ImageUploadWidget
                  pathPrefix="uploads"
                  onSuccess={(coverId) => {
                    if (book) {
                      updateBookCoverMutation.mutate({ bookId: book.id, coverId });
                      console.log({ wow: coverId });
                    }
                  }}
                />
              )}
            </Box>
          </Box>
          <Box mb={5}>
            <Card p={3} mt={4} rounded="2xl">
              <CardHeader display="flex" justifyContent="center">
                <Text textAlign="center" fontSize="large" fontWeight="bold">
                  Genre
                </Text>
              </CardHeader>
              <CardBody>
                {errors().genre ? (
                  <Text textAlign="center" color="red">
                    {errors().genre}
                  </Text>
                ) : null}
                <Wrap w="full" justify="center" gap={2}>
                  {genres.map((genre) => (
                    <Button
                      size="sm"
                      key={`button-${genre}`}
                      onClick={() => {
                        if (!(book.exclusiveStatus === "Exclusive" && user.data?.admin !== true)) {
                          setSelectedGenre(genre);
                          setFields("genre", genre);
                        }
                      }}
                      p={3}
                      bg={selectedGenre === genre ? "primary" : "bg.one"}
                      colorScheme={selectedGenre === genre ? primaryColorScheme : undefined}
                    >
                      {genre}
                    </Button>
                  ))}
                </Wrap>
              </CardBody>
            </Card>
            {book.complete === "1" ? (
              <Card bg={useColorModeValue("#DBFFCB", "#3BFF9A30")} p={3} mt={4} rounded="2xl">
                <CardHeader display="flex" justifyContent="center">
                  <Text textAlign="center" m={1} fontSize="large" fontWeight="bold">
                    Book Complete
                  </Text>
                </CardHeader>
                <CardBody>
                  <Flex direction="column" alignItems="center" gap={4}>
                    <svg
                      clipRule="evenodd"
                      fillRule="evenodd"
                      imageRendering="optimizeQuality"
                      shapeRendering="geometricPrecision"
                      textRendering="geometricPrecision"
                      viewBox="0 0 2666.66 2666.66"
                      width="50%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Layer_x0020_1">
                        <circle cx="1333.33" cy="1333.33" fill="#e2f0cb" r="1333.33" />
                        <g fill="#212121">
                          <path d="m1732.72 2186.64h-1044.26c-11.04 0-20-8.97-20-20v-1558.62c0-11.04 8.96-20 20-20h1044.26c11.04 0 20 8.96 20 20v952.7c0 26.33-40 26.32-40 0v-932.7h-1004.26v1518.6h1004.26v-94.93c0-26.33 40-26.32 40 0v114.93c.02 11.04-8.96 20.02-20 20.02z" />
                          <path d="m1280.72 939.75h-413.03c-26.33 0-26.33-40 0-40h413.03c26.32 0 26.34 40 0 40z" />
                          <path d="m1411.28 1173.54h-543.59c-26.33 0-26.33-40 0-40h543.59c26.33 0 26.33 40 0 40z" />
                          <path d="m1280.72 1407.34h-413.03c-26.33 0-26.33-40 0-40h413.03c26.32 0 26.34 40 0 40z" />
                          <path d="m1391.78 1641.14h-524.09c-26.33 0-26.33-40 0-40h524.09c26.32 0 26.32 40 0 40z" />
                          <path d="m1280.72 1874.93h-413.03c-26.33 0-26.33-40 0-40h413.03c26.32 0 26.34 40 0 40z" />
                          <path d="m1732.72 2071.71c-146.39 0-265.48-119.11-265.48-265.5 0-146.38 119.09-265.48 265.48-265.48s265.48 119.09 265.48 265.48-119.09 265.5-265.48 265.5zm0-490.97c-124.33 0-225.46 101.13-225.46 225.46s101.14 225.48 225.46 225.48c124.33 0 225.46-101.15 225.46-225.48s-101.13-225.46-225.46-225.46z" />
                          <path d="m1690.42 1898.5c-15.18 0-54.9-46.61-74.12-65.83-18.65-18.65 9.7-46.91 28.29-28.29l45.83 45.85 130.43-130.44c18.64-18.65 46.91 9.7 28.29 28.3l-144.57 144.57c-3.9 3.9-9.02 5.86-14.15 5.86z" />
                          <path d="m896.44 812.26c-92.56 0-92.59-140.65 0-140.65s92.56 140.65 0 140.65zm0-100.67c-39.93 0-39.93 60.67 0 60.67s39.93-60.67 0-60.67z" />
                          <path d="m1105.87 812.26c-92.54 0-92.56-140.65 0-140.65 92.58 0 92.56 140.65 0 140.65zm0-100.67c-39.92 0-39.94 60.67 0 60.67s39.92-60.67 0-60.67z" />
                          <path d="m1315.32 812.26c-92.56 0-92.59-140.65 0-140.65 92.57 0 92.56 140.65 0 140.65zm0-100.67c-39.93 0-39.93 60.67 0 60.67s39.92-60.67 0-60.67z" />
                          <path d="m1524.74 812.26c-92.54 0-92.56-140.65 0-140.65 92.58 0 92.57 140.65 0 140.65zm0-100.67c-39.91 0-39.91 60.67 0 60.67 39.93 0 39.93-60.67 0-60.67z" />
                          <path d="m896.44 711.59c-11.04 0-20-8.96-20-20v-191.57c0-26.33 40-26.33 40 0v191.58c0 11.05-8.96 20-20 20z" />
                          <path d="m1105.87 711.59c-11.04 0-20-8.96-20-20v-191.57c0-26.33 40-26.33 40 0v191.58c-.01 11.05-8.95 20-20 20z" />
                          <path d="m1315.32 711.59c-11.04 0-20-8.96-20-20v-191.57c0-26.33 40-26.33 40 0v191.58c0 11.05-8.96 20-20 20z" />
                          <path d="m1524.74 711.59c-11.04 0-20-8.96-20-20v-191.57c0-26.32 40-26.32 40 0v191.58c0 11.05-8.95 20-20 20z" />
                        </g>
                        <path
                          d="m1524.74 812.26c-80.64 0-97.04-114.87-20-137.76v-46.47h-169.43v46.48c77.07 22.89 60.65 137.76-20 137.76s-97.07-114.87-20-137.76v-46.47h-169.44v46.47c77.08 22.9 60.63 137.76-20 137.76-80.64 0-97.04-114.87-20-137.76v-46.47h-169.44v46.47c77.07 22.89 60.65 137.76-20 137.76s-97.07-114.87-20-137.76v-46.47h-167.98v1518.6h1004.26v-75.66c-137.08-10.26-245.48-125.09-245.48-264.75 0-139.65 108.4-254.47 245.48-264.73v-913.46h-167.98v46.47c77.07 22.9 60.65 137.76-20 137.76zm-657.05 321.28h543.59c26.33 0 26.33 40 0 40h-543.59c-26.33 0-26.33-40 0-40zm0 467.6h524.09c26.32 0 26.32 40 0 40h-524.09c-26.33 0-26.33-40 0-40zm0 233.79h413.03c26.32 0 26.34 40 0 40h-413.03c-26.33 0-26.32-40 0-40zm0-467.59h413.03c26.32 0 26.33 40 0 40h-413.03c-26.32 0-26.33-40 0-40zm413.03-427.59h-413.03c-26.33 0-26.33-40 0-40h413.03c26.32 0 26.34 40 0 40z"
                          fill="#ffdfce"
                        />
                        <path
                          d="m1849.14 1719.78c7.81 7.82 7.82 20.49 0 28.3l-144.57 144.57c-7.81 7.81-20.48 7.81-28.31 0l-59.97-59.97c-18.65-18.64 9.69-46.91 28.29-28.29l45.83 45.85 130.43-130.44c7.82-7.82 20.48-7.82 28.29 0zm109.05 86.43c0-124.33-101.13-225.46-225.46-225.46s-225.46 101.13-225.46 225.46 101.14 225.48 225.46 225.48c124.33 0 225.46-101.15 225.46-225.48z"
                          fill="#33cd62"
                        />
                        <path
                          d="m1315.32 772.26c39.93 0 39.92-60.67 0-60.67-39.93 0-39.93 60.67 0 60.67z"
                          fill="#6c7374"
                        />
                        <path
                          d="m1494.42 741.93c0 39.95 60.66 39.91 60.66 0s-60.66-39.95-60.66 0z"
                          fill="#6c7374"
                        />
                        <path
                          d="m1136.21 741.93c0-39.91-60.67-39.94-60.67 0s60.67 39.92 60.67 0z"
                          fill="#6c7374"
                        />
                        <path
                          d="m896.44 772.26c39.93 0 39.93-60.67 0-60.67s-39.93 60.67 0 60.67z"
                          fill="#6c7374"
                        />
                      </g>
                    </svg>
                    <Text>This Book has been marked as complete.</Text>
                  </Flex>
                </CardBody>
              </Card>
            ) : (
              <Card bg={useColorModeValue("#FFE3CB", "#FFA93B30")} p={3} mt={4} rounded="2xl">
                <CardHeader display="flex" justifyContent="center">
                  <Text textAlign="center" m={1} fontSize="large" fontWeight="bold">
                    Work in progress
                  </Text>
                </CardHeader>
                <CardBody>
                  <Flex direction="column" alignItems="center" gap={4}>
                    <svg
                      id="Layer_1"
                      viewBox="0 0 256 256"
                      width="50%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g>
                        <path
                          d="m199.422 137c-.829 0-1.5-.671-1.5-1.5v-43.315c0-5.34 4.345-9.685 9.685-9.685h3.815c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.5 1.5h-3.815c-3.686 0-6.685 2.998-6.685 6.685v43.315c0 .829-.671 1.5-1.5 1.5z"
                          fill="#3a312a"
                        />
                        <path
                          d="m225.546 26.133s3.408 12.659 13.222 13.246c0 0-13.1 4.525-13.321 14.202 0 0-2.579-13.572-12.925-14.059 0 .001 12.05-1.825 13.024-13.389z"
                          fill="#d7e057"
                        />
                        <path
                          d="m225.446 55.081c-.713 0-1.335-.506-1.472-1.217-.024-.124-2.495-12.417-11.522-12.842-.771-.037-1.388-.651-1.428-1.421-.04-.771.511-1.445 1.273-1.561.441-.069 10.894-1.818 11.754-12.033.061-.725.634-1.301 1.359-1.367.722-.064 1.393.399 1.583 1.102.032.116 3.259 11.626 11.864 12.141.714.043 1.297.584 1.396 1.292.098.708-.319 1.388-.994 1.623-.121.042-12.118 4.31-12.313 12.819-.018.767-.61 1.396-1.375 1.459-.041.004-.084.005-.125.005zm-7.741-15.729c3.878 1.969 6.23 5.746 7.587 8.876 2.026-4.021 5.941-6.787 8.949-8.427-4.134-1.843-6.783-5.651-8.334-8.723-1.794 4.36-5.272 6.869-8.202 8.274z"
                          fill="#3a312a"
                        />
                        <path
                          d="m203.847 43.114s2.411 8.954 9.352 9.369c0 0-9.266 3.201-9.422 10.045 0 0-1.824-9.6-9.142-9.944 0 .001 8.524-1.291 9.212-9.47z"
                          fill="#d7e057"
                        />
                        <path
                          d="m203.776 64.029c-.714 0-1.337-.507-1.473-1.22-.016-.082-1.704-8.442-7.739-8.726-.771-.037-1.388-.651-1.428-1.421-.04-.771.511-1.445 1.273-1.561.296-.047 7.364-1.243 7.942-8.114.061-.726.635-1.303 1.36-1.368.73-.062 1.392.399 1.582 1.102.021.079 2.228 7.92 7.994 8.265.714.043 1.299.584 1.396 1.293.098.709-.32 1.388-.996 1.622-.081.028-8.282 2.952-8.413 8.662-.018.768-.611 1.397-1.376 1.461-.04.003-.081.005-.122.005zm-4.519-11.528c2.107 1.333 3.523 3.395 4.447 5.28 1.376-2.233 3.515-3.872 5.365-4.973-2.287-1.27-3.884-3.35-4.941-5.224-1.174 2.288-3.015 3.876-4.871 4.917z"
                          fill="#3a312a"
                        />
                        <path
                          d="m203.847 16.456s2.411 8.954 9.352 9.369c0 0-9.266 3.201-9.422 10.045 0 0-1.824-9.599-9.142-9.944 0 .001 8.524-1.29 9.212-9.47z"
                          fill="#d7e057"
                        />
                        <path
                          d="m203.775 37.371c-.713 0-1.337-.507-1.472-1.22-.016-.082-1.704-8.441-7.739-8.726-.77-.037-1.387-.651-1.427-1.421-.04-.771.511-1.445 1.273-1.561.296-.047 7.364-1.243 7.942-8.113.061-.726.635-1.303 1.36-1.368.73-.063 1.392.4 1.582 1.102.021.079 2.228 7.919 7.994 8.264.715.043 1.299.584 1.396 1.293.098.709-.32 1.388-.996 1.622-.081.028-8.282 2.952-8.413 8.662-.018.768-.611 1.397-1.376 1.461-.041.004-.082.005-.124.005zm-4.518-11.527c2.107 1.333 3.523 3.394 4.447 5.28 1.376-2.232 3.515-3.872 5.365-4.973-2.287-1.269-3.884-3.35-4.941-5.223-1.174 2.286-3.015 3.875-4.871 4.916z"
                          fill="#3a312a"
                        />
                        <path d="m212.155 68.5h22.234v150.321h-22.234z" fill="#ef6d7a" />
                        <path
                          d="m234.389 220.321h-22.234c-.829 0-1.5-.671-1.5-1.5v-150.321c0-.829.671-1.5 1.5-1.5h22.234c.829 0 1.5.671 1.5 1.5v150.321c0 .828-.671 1.5-1.5 1.5zm-20.734-3h19.234v-147.321h-19.234z"
                          fill="#3a312a"
                        />
                        <path
                          d="m238.923 155.187h-31.301v-76.037c0-8.643 7.007-15.65 15.65-15.65 8.644 0 15.65 7.007 15.65 15.65v76.037z"
                          fill="#89c4db"
                        />
                        <path
                          d="m238.922 156.687h-31.301c-.829 0-1.5-.671-1.5-1.5v-76.037c0-9.457 7.694-17.15 17.15-17.15s17.15 7.694 17.15 17.15v76.037c.001.829-.67 1.5-1.499 1.5zm-29.8-3h28.301v-74.537c0-7.803-6.348-14.15-14.15-14.15-7.803 0-14.15 6.348-14.15 14.15v74.537z"
                          fill="#3a312a"
                        />
                        <path d="m234.389 218.821h-22.234l11.268 20.723z" fill="#87796f" />
                        <path
                          d="m223.422 241.044c-.549 0-1.055-.3-1.318-.784l-11.268-20.723c-.252-.464-.242-1.028.028-1.483s.761-.733 1.29-.733h22.234c.526 0 1.014.275 1.285.726s.287 1.011.04 1.476l-10.967 20.723c-.258.488-.765.795-1.317.798-.001 0-.004 0-.007 0zm-8.744-20.723 8.727 16.05 8.494-16.05z"
                          fill="#3a312a"
                        />
                        <path
                          d="m17.077 103.467v120.604c0 8.566 6.944 15.511 15.511 15.511h140.069c4.889 0 8.852-3.956 8.852-8.846 0-33.853 0-155.455 0-198.82 0-8.563-6.937-15.499-15.501-15.499-31.37 0-102.053 0-133.427 0-8.566 0-15.505 6.944-15.505 15.511v55.526 16.013z"
                          fill="#f16c7a"
                        />
                        <path
                          d="m172.657 241.082h-140.069c-9.38 0-17.011-7.631-17.011-17.011v-120.604c0-.829.671-1.5 1.5-1.5s1.5.671 1.5 1.5v120.604c0 7.726 6.285 14.011 14.011 14.011h140.069c4.054 0 7.353-3.295 7.353-7.345v-198.82c0-7.719-6.281-13.999-14.001-13.999h-133.426c-7.722 0-14.005 6.285-14.005 14.011v55.526c0 .829-.671 1.5-1.5 1.5s-1.5-.671-1.5-1.5v-55.526c0-9.38 7.629-17.011 17.005-17.011h133.427c9.374 0 17.001 7.626 17.001 16.999v198.82c-.001 5.704-4.645 10.345-10.354 10.345z"
                          fill="#3a312a"
                        />
                        <path
                          d="m123.209 227.127h35.753c4.889 0 8.853-3.963 8.853-8.852v-180.55c0-4.889-3.963-8.852-8.853-8.852h-119.336c-4.889 0-8.853 3.963-8.853 8.852v180.549c0 4.889 3.963 8.852 8.853 8.852h68.342 15.241z"
                          fill="#fae6ca"
                        />
                        <g fill="#3a312a">
                          <path d="m158.961 228.627h-35.752c-.829 0-1.5-.671-1.5-1.5s.671-1.5 1.5-1.5h35.752c4.054 0 7.353-3.298 7.353-7.352v-180.55c0-4.054-3.298-7.353-7.353-7.353h-119.335c-4.054 0-7.353 3.298-7.353 7.353v180.55c0 4.054 3.298 7.352 7.353 7.352h68.342c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.5 1.5h-68.342c-5.708 0-10.353-4.644-10.353-10.352v-180.55c0-5.708 4.644-10.353 10.353-10.353h119.335c5.709 0 10.353 4.644 10.353 10.353v180.55c0 5.708-4.644 10.352-10.353 10.352z" />
                          <path d="m145.282 153.5h-91.977c-.829 0-1.5-.671-1.5-1.5s.671-1.5 1.5-1.5h91.976c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.499 1.5z" />
                          <path d="m145.282 203.651h-91.977c-.829 0-1.5-.671-1.5-1.5s.671-1.5 1.5-1.5h91.976c.829 0 1.5.671 1.5 1.5.001.829-.671 1.5-1.499 1.5z" />
                          <path d="m145.282 178.576h-91.977c-.829 0-1.5-.671-1.5-1.5s.671-1.5 1.5-1.5h91.976c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.499 1.5z" />
                          <path d="m101.294 52.867c-.829 0-1.5-.671-1.5-1.5v-5.121c0-.829.671-1.5 1.5-1.5s1.5.671 1.5 1.5v5.121c0 .828-.672 1.5-1.5 1.5z" />
                          <path d="m122.737 59.985c-.312 0-.627-.097-.896-.298-.664-.496-.801-1.435-.305-2.099l3.063-4.105c.496-.664 1.436-.801 2.099-.305.664.496.801 1.435.305 2.099l-3.063 4.105c-.294.395-.746.603-1.203.603z" />
                          <path d="m135.669 78.515c-.647 0-1.244-.421-1.438-1.073-.236-.794.217-1.629 1.011-1.865l4.909-1.459c.793-.233 1.629.216 1.865 1.011.236.794-.217 1.629-1.011 1.865l-4.909 1.459c-.142.042-.285.062-.427.062z" />
                          <path d="m139.76 102.866c-.172 0-.347-.03-.518-.093l-4.807-1.767c-.777-.286-1.176-1.147-.89-1.925.286-.777 1.147-1.177 1.925-.89l4.807 1.767c.777.286 1.176 1.148.89 1.925-.222.607-.796.983-1.407.983z" />
                          <path d="m79.85 59.985c-.457 0-.909-.208-1.203-.603l-3.063-4.105c-.496-.664-.359-1.604.305-2.099.663-.496 1.604-.36 2.099.305l3.063 4.105c.496.664.359 1.603-.305 2.099-.269.202-.584.298-.896.298z" />
                          <path d="m66.919 78.515c-.142 0-.285-.02-.428-.063l-4.91-1.459c-.794-.236-1.247-1.071-1.011-1.865s1.071-1.247 1.865-1.011l4.91 1.459c.794.236 1.247 1.071 1.011 1.865-.194.652-.791 1.074-1.437 1.074z" />
                          <path d="m62.827 102.866c-.611 0-1.185-.376-1.408-.983-.286-.778.113-1.64.89-1.925l4.807-1.767c.777-.287 1.64.113 1.925.89.286.778-.113 1.64-.89 1.925l-4.807 1.767c-.17.063-.345.093-.517.093z" />
                        </g>
                        <path
                          d="m125.275 86.411c0 6.088-2.261 11.625-6.001 15.857-3.522 3.986-5.769 8.9-6.697 14.118h-22.568c-.928-5.218-3.16-10.132-6.697-14.132-3.725-4.218-6.001-9.77-6.001-15.843 0-12.611 10.103-23.279 22.685-23.945 13.829-.726 25.279 10.276 25.279 23.945z"
                          fill="#d6df58"
                        />
                        <path
                          d="m112.578 117.886h-22.569c-.727 0-1.35-.521-1.477-1.237-.906-5.099-3.1-9.733-6.343-13.401-4.112-4.657-6.377-10.636-6.377-16.837 0-13.325 10.814-24.739 24.105-25.443 7.081-.362 13.792 2.102 18.914 6.963 5.123 4.861 7.944 11.425 7.944 18.48 0 6.212-2.265 12.196-6.377 16.851-3.246 3.673-5.439 8.303-6.344 13.387-.127.715-.749 1.237-1.476 1.237zm-21.337-3h20.104c1.122-5.142 3.46-9.826 6.805-13.611 3.627-4.106 5.625-9.385 5.625-14.864 0-6.225-2.489-12.015-7.01-16.304-4.52-4.288-10.45-6.475-16.69-6.143-11.724.621-21.263 10.691-21.263 22.447 0 5.469 1.998 10.743 5.626 14.85 3.342 3.78 5.68 8.469 6.803 13.625z"
                          fill="#3a312a"
                        />
                        <path
                          d="m112.574 116.392h-22.561v8.305c0 1.902 1.542 3.444 3.444 3.444h15.673c1.902 0 3.444-1.542 3.444-3.444z"
                          fill="#87796f"
                        />
                        <path
                          d="m109.13 129.641h-15.673c-2.726 0-4.944-2.218-4.944-4.944v-8.305c0-.829.671-1.5 1.5-1.5h22.561c.829 0 1.5.671 1.5 1.5v8.305c0 2.726-2.218 4.944-4.944 4.944zm-17.617-11.749v6.805c0 1.072.872 1.944 1.944 1.944h15.673c1.072 0 1.944-.872 1.944-1.944v-6.805z"
                          fill="#3a312a"
                        />
                        <path
                          d="m101.294 136c-4.207 0-7.618-3.41-7.618-7.618v-.241h15.235v.241c0 4.208-3.41 7.618-7.617 7.618z"
                          fill="#87796f"
                        />
                        <path
                          d="m101.294 137.5c-5.027 0-9.118-4.09-9.118-9.118v-.241c0-.829.671-1.5 1.5-1.5h15.235c.829 0 1.5.671 1.5 1.5v.241c0 5.028-4.09 9.118-9.117 9.118zm-5.988-7.859c.582 2.771 3.045 4.859 5.987 4.859s5.406-2.087 5.987-4.859z"
                          fill="#3a312a"
                        />
                        <path
                          d="m108.632 117.886c-.829 0-1.5-.671-1.5-1.5l-.044-20.764c-.597 0-1.112-.349-1.354-.854l-.588-1.019-.628 1.088c-.268.464-.763.75-1.299.75s-1.031-.286-1.299-.75l-.628-1.088-.628 1.088c-.268.464-.763.75-1.299.75s-1.031-.286-1.299-.75l-.629-1.088-.56.971c-.231.531-.76.902-1.376.902h-.044v20.764c0 .829-.671 1.5-1.5 1.5s-1.5-.671-1.5-1.5v-20.764h-1.187c-2.309 0-4.187-1.878-4.187-4.187s1.879-4.187 4.187-4.187c2.227 0 4.054 1.748 4.18 3.944l.688-1.192c.268-.464.763-.75 1.299-.75s1.031.286 1.299.75l.628 1.088.628-1.088c.268-.464.763-.75 1.299-.75s1.031.286 1.299.75l.628 1.088.628-1.088c.268-.464.763-.75 1.299-.75s1.031.286 1.299.75l.694 1.202c.122-2.201 1.95-3.954 4.181-3.954 2.309 0 4.187 1.878 4.187 4.187s-1.878 4.187-4.187 4.187h-1.187v20.764c0 .828-.672 1.5-1.5 1.5zm1.5-25.264h1.187c.654 0 1.187-.533 1.187-1.187s-.533-1.187-1.187-1.187-1.187.533-1.187 1.187zm-18.863-2.374c-.654 0-1.187.533-1.187 1.187s.533 1.187 1.187 1.187h1.187v-1.187c0-.655-.533-1.187-1.187-1.187z"
                          fill="#3a312a"
                        />
                        <path
                          d="m158.96 30.37h-15c4.06 0 7.35 3.3 7.35 7.36v180.54c0 4.06-3.29 7.36-7.35 7.36h15c4.06 0 7.35-3.3 7.35-7.36v-180.54c0-4.06-3.29-7.36-7.35-7.36z"
                          fill="#decaad"
                        />
                      </g>
                    </svg>
                    {book._count.Chapter >= 10 ? (
                      <Button
                        isLoading={markAsCompleteMutation.isLoading}
                        onClick={() =>
                          modals.confirm({
                            title: "Mark as Complete",

                            body: (
                              <div>
                                <p>
                                  You're about to mark this book as complete. By doing this, you're
                                  letting your readers know that this amazing literary journey has
                                  finally reached its end. You're almost there! Before marking your
                                  book as complete, kindly:
                                </p>
                                <List className="my-3">
                                  <ListItem>🔸Note that you will not be able to undo this</ListItem>
                                  <ListItem>
                                    🔸Check that all chapters are uploaded and in order
                                  </ListItem>
                                  <ListItem>
                                    🔸Note that adding more chapters won't be possible
                                  </ListItem>
                                  <ListItem>
                                    🔸You will still be able to edit or fix existing chapters
                                  </ListItem>
                                  <ListItem>
                                    🔸Feel proud of bringing a complete story to your readers
                                  </ListItem>
                                </List>
                                <p>Ready to mark this milestone with your audience?</p>
                              </div>
                            ),
                            confirmProps: {
                              colorScheme: "green",
                              label: "Mark as Complete",
                              isLoading: markAsCompleteMutation.isLoading,
                            },
                            onConfirm: () => {
                              markAsCompleteMutation.mutate({ bookId: book.id });
                              console.log("wow");
                            }, // action
                          })
                        }
                        mt={3}
                        colorScheme="green"
                        w="full"
                      >
                        Mark Book as Complete
                      </Button>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        You need 10 published chapters before you can mark this as complete
                      </Alert>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            )}
            {book.exclusiveStatus === "NotExclusive" ? (
              <Card
                bg={useColorModeValue("#E5CBFF", "#2E1841")}
                p={3}
                mt={4}
                rounded="2xl"
                position="relative"
              >
                <CardHeader display="flex" justifyContent="center">
                  <VStack>
                    <Center>
                      <span className="inline-flex items-center gap-x-1.5 rounded-full px-4 py-1 text-xs font-medium text-gray-100 ring-1 ring-inset ring-gray-200">
                        <svg
                          className="h-1.5 w-1.5 fill-indigo-500"
                          viewBox="0 0 6 6"
                          aria-hidden="true"
                        >
                          <circle cx={3} cy={3} r={3} />
                        </svg>
                        Beta
                      </span>
                    </Center>
                    <Text textAlign="center" m={1} fontSize="large" fontWeight="bold">
                      Publish Premium Book
                    </Text>
                  </VStack>
                </CardHeader>
                <CardBody>
                  <Flex direction="column" alignItems="center" gap={4}>
                    <Image w="50%" src="/publishing.svg" />
                    {book.complete === "1" ? (
                      <Button
                        isLoading={requestExclusiveMutation.isLoading}
                        onClick={() =>
                          modals.confirm({
                            title: "Publish Premium Book",

                            body: (
                              <div>
                                <p>
                                  Hey there! We're excited to work with you on publishing your book.
                                  Here's a quick and friendly rundown of our terms and conditions:
                                </p>
                                <List className="my-3">
                                  <ListItem>
                                    🔸You're giving us the exclusive rights to publish and sell your
                                    awesome Book
                                  </ListItem>
                                  <ListItem>
                                    🔸 We'll provide you with an advance payment, and you'll also
                                    earn from your Book's performance
                                  </ListItem>
                                  <ListItem>
                                    🔸 We'll make editorial changes to polish your Book, but we'll
                                    need your permission for major revisions
                                  </ListItem>
                                  <ListItem>
                                    🔸You'll keep the copyright, and we'll have the rights to use
                                    your name and some excerpts for promoting your work
                                  </ListItem>
                                  <ListItem>
                                    🔸We'll be a team in marketing and promoting your Book to reach
                                    its potential
                                  </ListItem>
                                  <ListItem>
                                    🔸Together, we'll decide on the perfect book launch date
                                  </ListItem>
                                  <ListItem>
                                    🔸 If any major issues arise, either of us can terminate the
                                    Agreement
                                  </ListItem>
                                  <ListItem>
                                    🔸 We'd love the opportunity to work on your future works within
                                    a specific genre or subject matter
                                  </ListItem>
                                </List>
                                <p>
                                  In a nutshell, we'll work closely together to make your Book a
                                  success. We look forward to this journey together and can't wait
                                  to celebrate your accomplishments!. You can view the terms and
                                  conditions{" "}
                                  <a className="link" href="/premium-terms" target="_blank">
                                    here
                                  </a>
                                </p>
                              </div>
                            ),
                            confirmProps: {
                              colorScheme: "green",
                              label: "Submit for review",
                              isLoading: requestExclusiveMutation.isLoading,
                            },
                            onConfirm: () => {
                              requestExclusiveMutation.mutate({ bookId: book.id });
                              console.log("wow");
                            }, // action
                          })
                        }
                        mt={3}
                        colorScheme="purple"
                        w="full"
                      >
                        Get Started
                      </Button>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        Once you complete this book, you can apply for it to be added to our premium
                        collection
                      </Alert>
                    )}
                    {book.exclusiveMessage && (
                      <Alert status="warning">
                        <AlertIcon />
                        {book.exclusiveMessage}
                      </Alert>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            ) : book.exclusiveStatus === "Exclusive" ? (
              <Card bg={useColorModeValue("#E5CBFF", "#2E1841")} p={3} mt={4} rounded="2xl">
                <CardHeader display="flex" justifyContent="center">
                  <Text textAlign="center" m={1} fontSize="large" fontWeight="bold">
                    Premium Book
                  </Text>
                </CardHeader>
                <CardBody>
                  <Flex direction="column" alignItems="center" gap={4}>
                    <Image w="50%" src="/premium.svg" />
                    <Text>This book is a Visionary Writings exclusive.</Text>
                    {premiumBooksViews.isLoading ? null : (
                      <Text fontWeight="bold">Total Premium Views: {premiumBooksViews.data}</Text>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            ) : (
              <Card bg={useColorModeValue("#E5CBFF", "#2E1841")} p={3} mt={4} rounded="2xl">
                <CardHeader display="flex" justifyContent="center">
                  <Text textAlign="center" m={1} fontSize="large" fontWeight="bold">
                    Under Review
                  </Text>
                </CardHeader>
                <CardBody>
                  <Flex direction="column" alignItems="center" gap={4}>
                    <Image w="50%" src="/processing.svg" />
                    {user.data?.admin ? (
                      <VStack w="full">
                        <Button
                          w="full"
                          onClick={() =>
                            modals.confirm({
                              title: "Approve Premium Book",

                              body: "Are you sure you want to approve this request?",
                              confirmProps: {
                                colorScheme: "green",
                                label: "Approve",
                                isLoading: requestExclusiveMutation.isLoading,
                              },
                              onConfirm: () => {
                                confirmExclusiveMutation.mutate({ bookId: book.id });
                              }, // action
                            })
                          }
                        >
                          Approve Request
                        </Button>
                        <RejectedModalForm book={book} />
                      </VStack>
                    ) : (
                      <Text>
                        Just a heads up that this book is in the process of being reviewed to become
                        a Visionary Writings exclusive. It might take a few days, so please bear
                        with us.
                      </Text>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            )}
          </Box>
        </GridItem>
        <GridItem colSpan={3}>
          <form ref={form}>
            <FormControl isInvalid={!!errors().title}>
              <FormLabel fontSize="large" fontWeight="bold">
                Title
              </FormLabel>
              <Input
                isDisabled={book.exclusiveStatus === "Exclusive" && user.data?.admin !== true}
                name="title"
                defaultValue={book.title}
                variant="outline"
                bg="inputBg"
              />
              {errors().title ? <FormErrorMessage>{errors().title}</FormErrorMessage> : null}
            </FormControl>
            <Text m={2} fontSize="large" fontWeight="bold">
              Description
            </Text>
            <Tiptap
              isDisabled={book.exclusiveStatus === "Exclusive" && user.data?.admin !== true}
              value={book.description ?? ""}
              onChange={(v) => {
                setNewDescription(v);
                setFields("description", v);
              }}
            />
          </form>
          <ChapterSection book={book} />
        </GridItem>
      </SimpleGrid>
    </>
  );
};

type ChapterSectionProps = {
  book: NonNullable<RouterOutput["author"]["getBook"]>;
};
const ChapterSection = ({ book }: ChapterSectionProps) => {
  //const { navigate } = useMatch({ from: bookDetailsIndexRoute.id });
  const primaryColorScheme = usePrimaryColorScheme();

  return (
    <Box rounded="2xl" bg="bg.card" mt={10} p={5}>
      <Flex justify="space-between" alignItems="center">
        <HStack>
          <Heading size="md">Chapters</Heading>
        </HStack>
        {book.complete !== "1" && (
          <Link to="/app/books/$bookId/chapters/create" params={{ bookId: book.id.toString() }}>
            <Button
              variant="outline"
              p={6}
              colorScheme={primaryColorScheme}
              my={4}
              _hover={{ bg: "primary", color: "primaryText" }}
              rightIcon={<PlusCircle size={25} weight="fill" />}
            >
              Add Chapter
            </Button>
          </Link>
        )}
      </Flex>
      <Tabs isFitted>
        <TabList>
          <Tab>Published</Tab>
          <Tab>Draft</Tab>
          <Tab>Trashed</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Alert my={2} status="info">
              <AlertIcon />
              Hooray! These are your published chapters. Your readers can enjoy all of these right
              now.
            </Alert>
            <ChaptersList bookId={book.id} type="published" />
          </TabPanel>
          <TabPanel px={0}>
            <Alert my={2} status="info">
              <AlertIcon />
              Welcome to your drafts! Feel free to save any incomplete work here. Publish them when
              you're ready to share with the world.
            </Alert>
            <ChaptersList bookId={book.id} type="draft" />
          </TabPanel>
          <TabPanel px={0}>
            <Alert my={2} status="info">
              <AlertIcon />
              Oops! These are your trashed chapters. But don't worry, you can still restore them
              from the chapter edit screen.
            </Alert>
            <ChaptersList bookId={book.id} type="trashed" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

type ChaptersListProps = {
  bookId: number;
  type: "published" | "draft" | "trashed";
};
const ChaptersList = (props: ChaptersListProps) => {
  const navigate = useNavigate({ from: bookDetailsRoute.id });
  const [currentPage, setCurrentPage] = useState(1);
  const publishedQuery = trpc.author.chapters.getAll.useQuery(
    { bookId: props.bookId, page: currentPage, type: "published" },
    { keepPreviousData: true }
  );
  const draftQuery = trpc.author.chapters.getAll.useQuery(
    { bookId: props.bookId, page: currentPage, type: "draft" },
    { keepPreviousData: true }
  );

  const trashedQuery = trpc.author.chapters.getTrashedChapters.useQuery(
    { bookId: props.bookId, page: currentPage },
    { keepPreviousData: true }
  );

  let chapterQuery = publishedQuery;
  if (props.type === "draft") chapterQuery = draftQuery;
  if (props.type === "trashed") chapterQuery = trashedQuery;

  const chapterQueryData = chapterQuery.data;

  return (
    <div>
      {!chapterQuery.isLoading && chapterQuery.data ? (
        <Flex flexDirection="column" minH={"md"} alignItems="center">
          {chapterQuery.data.chapters.length > 0 ? (
            <VStack minH={"md"} w="full">
              {chapterQuery.data.chapters.map((chapter) => (
                <Box
                  w="full"
                  border="1px solid"
                  borderColor={"muted"}
                  rounded="md"
                  p={3}
                  key={`chapter-${chapter.id}`}
                  _hover={{ bg: "primary", color: "primaryText", cursor: "pointer" }}
                  onClick={() => {
                    navigate({
                      to: "/app/books/$bookId/chapters/$chapterId",
                      params: {
                        chapterId: chapter.id.toString(),
                        bookId: props.bookId.toString(),
                      },
                    });
                  }}
                >
                  <Text fontWeight="bold">{chapter.title}</Text>
                </Box>
              ))}
            </VStack>
          ) : null}
        </Flex>
      ) : (
        <VStack w="full" h="full">
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
          <Skeleton w="full" height="50px" />
        </VStack>
      )}
      <Spacer />
      {chapterQueryData ? (
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
            disabled={currentPage === chapterQueryData.pagination.totalPages}
            onClick={() => {
              setCurrentPage(Math.min(currentPage + 1, chapterQueryData.pagination.totalPages));
            }}
          >
            Next
          </Button>
          <Button
            disabled={currentPage === chapterQueryData.pagination.totalPages}
            onClick={() => {
              setCurrentPage(chapterQueryData.pagination.totalPages);
            }}
          >
            {chapterQueryData.pagination.totalPages}
          </Button>
        </Center>
      ) : null}
    </div>
  );
};

type RejectedModalFormProps = {
  book: NonNullable<RouterOutput["author"]["getBook"]>;
};
const RejectedModalForm = (props: RejectedModalFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState("");
  const rejectExclusiveMutation = trpc.author.rejectExclusive.useMutation();
  return (
    <>
      <Button w="full" colorScheme="red" variant="outline" onClick={onOpen}>
        Reject Request
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder="Rejection Reason"
              size="sm"
              resize="vertical"
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              isLoading={rejectExclusiveMutation.isLoading}
              onClick={() => {
                rejectExclusiveMutation.mutate({ bookId: props.book.id, message });
              }}
              variant="ghost"
            >
              Confirm Rejection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BookDetails;
