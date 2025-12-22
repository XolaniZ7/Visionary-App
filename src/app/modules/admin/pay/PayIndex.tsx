import {
  Avatar,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  VStack,
} from "@chakra-ui/react";
import { Center, Text } from "@chakra-ui/react";
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Card, CardBody, List, SearchInput } from "@saas-ui/react";
import { Loader } from "@saas-ui/react";
import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useState } from "react";

dayjs.extend(localizedFormat);

const PayIndex = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const result = trpc.searchAuthors.useQuery({ searchTerm });
  return (
    <Container maxW="container.md">
      <Tabs isFitted>
        <TabList>
          <Tab>Payment Requests</Tab>
          <Tab>Pay User</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <PaymentDetailsIndex />
          </TabPanel>
          <TabPanel p={0}>
            <VStack alignItems="flex-start" spacing={6}>
              <Heading>Pay User</Heading>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                onReset={() => setSearchTerm("")}
                placeholder="Search"
              />
              {result.data && result.data.length > 0 && (
                <Card w="full" bg="bg.card" shadow="lg">
                  <CardBody>
                    <List
                      items={result.data.map(({ item }) => ({
                        onClick: () =>
                          router.navigate({
                            to: "/app/admin/pay/$userId",
                            params: { userId: item.id.toString() },
                          }),
                        //href: `/app/admin/pay/${item.id}`,
                        icon: (
                          <Avatar
                            name={item.name}
                            src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/avatars/${item.avatar}/Thumbnail`}
                            size="md"
                          />
                        ),
                        primary: [item.name, item.lastname].join(" "),
                        secondary: item.email,
                        tertiary: <Tag>R{item.amount}</Tag>,
                      }))}
                    />
                  </CardBody>
                </Card>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default PayIndex;

const PaymentDetailsIndex = () => {
  const paymentRequests = trpc.admin.paymentRequest.getAll.useQuery();
  const router = useRouter();

  if (paymentRequests.isLoading) return <Loader variant="overlay" />;

  return (
    <div className="w-full mt-10">
      <Heading mb={5}>Payment Requests</Heading>
      {paymentRequests.data && paymentRequests.data.length ? (
        <Card w="full" bg="bg.card" shadow="lg">
          <CardBody>
            <List
              items={paymentRequests.data.map((item) => ({
                onClick: () =>
                  router.navigate({
                    to: "/app/admin/pay/$userId",
                    params: { userId: item.usersId.toString() },
                    search: { paymentRequestId: item.id },
                  }),
                //href: `/app/admin/pay/${item.id}`,
                icon: (
                  <Avatar
                    name={item.user.name}
                    // src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/avatars/${item}/Thumbnail`}
                    size="sm"
                  />
                ),
                primary: [item.user.name, item.user.lastname].join(" "),
                secondary: item.user.email,
                flexWrap: "wrap",
                tertiary: <Tag>R{item.amount.toString()}</Tag>,
              }))}
            />
          </CardBody>
        </Card>
      ) : (
        <Center p={10} border="1px solid" borderColor="primary">
          <Text>No Data</Text>
        </Center>
      )}
    </div>
  );
};
