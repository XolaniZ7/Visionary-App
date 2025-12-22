import {
  Box,
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
import { z } from "zod";

import type { RouterOutput } from "@server/trpc/router";

const BankDetailsIndex = () => {
  const bankDetails = trpc.author.bankDetails.get.useQuery();

  if (bankDetails.isLoading) return <p>Loading</p>;

  return (
    <Box p={3}>
      <Flex justifyContent="space-between">
        <Heading mb={5}>Bank Details</Heading>
      </Flex>
      {bankDetails.data ? <BankDetailsForm bankDetails={bankDetails.data} /> : <BankDetailsForm />}
    </Box>
  );
};

type BankDetailsFormProps = {
  bankDetails?: RouterOutput["author"]["bankDetails"]["get"];
};
const BankDetailsForm = ({ bankDetails }: BankDetailsFormProps) => {
  const toast = useToast();
  const updateBankDetailsMutation = trpc.author.bankDetails.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bank Details Updated Sucessfully",
        status: "success",
        position: "top-right",
        isClosable: true,
      });
    },
  });

  const schema = z.object({
    name: z.string().min(2),
    surname: z.string().min(2),
    bankName: z.string().min(2),
    accountNumber: z.string().min(2),
    branch: z.string().min(2),
  });

  const { form, errors } = useForm<z.infer<typeof schema>>({
    onSubmit(values) {
      console.log({ values });
      updateBankDetailsMutation.mutate({ ...values, id: bankDetails?.id });
    },
    extend: validator({ schema }),
    initialValues: {
      name: bankDetails?.name ?? "",
      surname: bankDetails?.surname ?? "",
      bankName: bankDetails?.bankName ?? "",
      accountNumber: bankDetails?.accountNumber ?? "",
      branch: bankDetails?.branch ?? "",
    },
  });

  return (
    <Container m={0}>
      <form ref={form}>
        <FormControl isInvalid={!!errors().name}>
          <FormLabel fontWeight="bold">Name</FormLabel>
          <Input name="name" type="text" />
          {errors().name ? <FormErrorMessage> {errors().name}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={!!errors().surname}>
          <FormLabel fontWeight="bold">Surname</FormLabel>
          <Input name="surname" type="text" />
          {errors().surname ? <FormErrorMessage> {errors().surname}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={!!errors().bankName}>
          <FormLabel fontWeight="bold">Bank Name</FormLabel>
          <Input name="bankName" type="text" />
          {errors().bankName ? <FormErrorMessage> {errors().bankName}</FormErrorMessage> : null}
        </FormControl>
        <FormControl isInvalid={!!errors().accountNumber}>
          <FormLabel fontWeight="bold">Account Number</FormLabel>
          <Input name="accountNumber" type="text" />
          {errors().accountNumber ? (
            <FormErrorMessage> {errors().accountNumber}</FormErrorMessage>
          ) : null}
        </FormControl>
        <FormControl isInvalid={!!errors().branch}>
          <FormLabel fontWeight="bold">Branch</FormLabel>
          <Input name="branch" type="text" />
          {errors().branch ? <FormErrorMessage> {errors().branch}</FormErrorMessage> : null}
        </FormControl>
        <Flex mt={2} justifyContent="flex-end">
          <Button
            isLoading={updateBankDetailsMutation.isLoading}
            type="submit"
            colorScheme="primary"
            bg="primary"
            _hover={{ background: "primaryHighlight" }}
          >
            Save
          </Button>
        </Flex>
      </form>
    </Container>
  );
};

export default BankDetailsIndex;
