import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { ArrowCircleRight } from "phosphor-react";
import { usePrimaryColor } from "src/app/theme";
import type { Singular } from "src/shared/types";
import { z } from "zod";

import type { RouterOutput } from "@server/trpc/router";

const ManagePayfastIndex = () => {
  const primaryColorScheme = usePrimaryColor();
  const payfastData = trpc.admin.payfast.get.useQuery();
  const payfastProduction = trpc.admin.payfast.isProductionEnabled.useQuery();
  const updatePayfastProduction = trpc.admin.payfast.setProductionEnabled.useMutation();

  if (payfastData.isLoading || payfastProduction.isLoading) return <p>Loading...</p>;
  if (payfastData.data && payfastProduction.data) {
    return (
      <Container maxW="container.lg">
        {payfastProduction.data.sandbox_enabled ? (
          <Alert borderRadius="md" mb={5} status="info">
            <Flex w="full" gap={3} justifyContent="space-between" alignItems="center">
              <AlertTitle>Sandbox Enabled</AlertTitle>
              <Box>
                <Button
                  isLoading={updatePayfastProduction.isLoading}
                  onClick={() => updatePayfastProduction.mutate(false)}
                  colorScheme="purple"
                >
                  Enable Production
                </Button>
              </Box>
            </Flex>
          </Alert>
        ) : (
          <Alert borderRadius="md" mb={5} status="success">
            <Flex w="full" gap={3} justifyContent="space-between" alignItems="center">
              <AlertTitle>Production Enabled</AlertTitle>
              <Box>
                <Button
                  isLoading={updatePayfastProduction.isLoading}
                  onClick={() => updatePayfastProduction.mutate(true)}
                  colorScheme="red"
                >
                  Enable Sandbox
                </Button>
              </Box>
            </Flex>
          </Alert>
        )}
        <Tabs isFitted>
          <TabList>
            <Tab>Production</Tab>
            <Tab>Sandbox</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <PayfastForm payfastData={payfastData.data[1]} />
            </TabPanel>
            <TabPanel>
              <PayfastForm payfastData={payfastData.data[0]} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    );
  }
  return <p>404</p>;
};

type PayfastFormProps = {
  payfastData: Singular<RouterOutput["admin"]["payfast"]["get"]>;
};
const PayfastForm = ({ payfastData }: PayfastFormProps) => {
  const updateMutation = trpc.admin.payfast.update.useMutation();
  const toast = useToast();
  const primaryColorScheme = usePrimaryColor();
  const schema = z.object({
    merchant_id: z.coerce.number().min(1),
    merchant_key: z.string().min(1),
    passphrase: z.string().min(1),
  });

  const { form, errors } = useForm({
    onSubmit: (values) => {
      console.log(values);
      updateMutation.mutate(
        {
          ...schema.parse(values),
          id: z.coerce.number().parse(payfastData.id),
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
    },
    extend: validator({ schema }),
    initialValues: {
      merchant_id: payfastData.merchant_id,
      merchant_key: payfastData.merchant_key,
      passphrase: payfastData.passphrase,
    },
  });
  return (
    <form ref={form}>
      <FormControl isInvalid={!!errors().merchant_id} mb={4}>
        <FormLabel fontWeight="bold">Merchant Id</FormLabel>
        <Input name="merchant_id" variant="outline" />
        {errors().merchant_id ? <FormErrorMessage>{errors().merchant_id}</FormErrorMessage> : null}
      </FormControl>
      <FormControl isInvalid={!!errors().merchant_key} mb={4}>
        <FormLabel fontWeight="bold">Merchant Key</FormLabel>
        <Input name="merchant_key" variant="outline" />
        {errors().merchant_key ? (
          <FormErrorMessage>{errors().merchant_key}</FormErrorMessage>
        ) : null}
      </FormControl>
      <FormControl isInvalid={!!errors().passphrase} mb={4}>
        <FormLabel fontWeight="bold">Passphrase</FormLabel>
        <Input name="passphrase" variant="outline" />
        {errors().passphrase ? <FormErrorMessage>{errors().passphrase}</FormErrorMessage> : null}
      </FormControl>
      <Button
        isLoading={updateMutation.isLoading}
        type="submit"
        p={6}
        colorScheme={primaryColorScheme}
        bg={"primary"}
        mt={10}
        rightIcon={<ArrowCircleRight size={25} weight="fill" />}
      >
        Submit
      </Button>
    </form>
  );
};

export default ManagePayfastIndex;
