import {
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { useRouter } from "@tanstack/react-router";
import { ArrowCircleRight } from "phosphor-react";
import { usePrimaryColor } from "src/app/theme";
import { z } from "zod";

import type { RouterOutput } from "@server/trpc/router";

type AdsCreateProps = {
  ad?: RouterOutput["admin"]["ads"]["get"];
};
const AdsCreate = ({ ad }: AdsCreateProps) => {
  return (
    <Container>
      {ad?.id ? <Heading mb={3}>Edit Ad: {ad.id}</Heading> : <Heading mb={3}>Create Ad</Heading>}
      <AdsCreateForm ad={ad} />
    </Container>
  );
};

type AdsCreateFormProps = {
  ad?: RouterOutput["admin"]["ads"]["get"];
};
const AdsCreateForm = ({ ad }: AdsCreateFormProps) => {
  const toast = useToast();
  const router = useRouter();
  const createAdMutation = trpc.admin.ads.create.useMutation();
  const updateAdMutation = trpc.admin.ads.update.useMutation();
  const primaryColorScheme = usePrimaryColor();
  const schema = z.object({
    adPlacemant: z.coerce.string().min(1),
    pagePlacement: z.string().min(1),
    adCode: z.string().min(1),
  });

  const { form, errors } = useForm({
    onSubmit: (values) => {
      console.log(values);
      if (ad?.id) {
        updateAdMutation.mutate(
          {
            ...schema.parse(values),
            id: ad.id,
          },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Details have been updated",
                status: "success",
                isClosable: true,
                position: "top-right",
              });
            },
          }
        );
      } else {
        createAdMutation.mutate(
          {
            ...schema.parse(values),
          },
          {
            onSuccess: () => {
              router.navigate({ to: "/app/admin/ads" });
              toast({
                title: "Success",
                description: "You Ad has been created",
                status: "success",
                isClosable: true,
                position: "top-right",
              });
            },
          }
        );
      }
    },
    extend: validator({ schema }),
    initialValues: {
      adPlacemant: ad?.type ?? "",
      pagePlacement: ad?.page ?? "",
      adCode: ad?.code ?? "",
    },
  });

  return (
    <form ref={form}>
      <FormControl isInvalid={!!errors().adPlacemant} mb={4}>
        <FormLabel fontWeight="bold">Ad Placement</FormLabel>

        <Select name="adPlacemant">
          <option value="Top">Above</option>
          <option value="Bottom">Below</option>
          <option value="sidebar">Side bar</option>
          <option value="afterTwoBooks">After Every Two Books</option>
          <option value="aftertwochapters">After Every Two Chapters</option>
          <option value="inChapters">In Chapters</option>
        </Select>
        {errors().adPlacemant ? <FormErrorMessage>{errors().adPlacemant}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={!!errors().pagePlacement} mb={4}>
        <FormLabel fontWeight="bold">Page Placement</FormLabel>
        <Select name="pagePlacement">
          <option value="Books">Books</option>
          <option value="Chapters">Chapters</option>
          <option value="reading_page">Reading page</option>
        </Select>
        {errors().pagePlacement ? (
          <FormErrorMessage>{errors().pagePlacement}</FormErrorMessage>
        ) : null}
      </FormControl>
      <FormControl isInvalid={!!errors().adCode} mb={4}>
        <FormLabel fontWeight="bold">Code</FormLabel>
        <Textarea rows={12} name="adCode" variant="outline" />
        {errors().adCode ? <FormErrorMessage>{errors().adCode}</FormErrorMessage> : null}
      </FormControl>
      <Flex justifyContent="flex-end">
        <Button
          isLoading={createAdMutation.isLoading || updateAdMutation.isLoading}
          type="submit"
          p={6}
          colorScheme={primaryColorScheme}
          bg={"primary"}
          mt={10}
          rightIcon={<ArrowCircleRight size={25} weight="fill" />}
        >
          Submit
        </Button>
      </Flex>
    </form>
  );
};

export default AdsCreate;
