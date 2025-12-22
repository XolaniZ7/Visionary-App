import {
  AspectRatio,
  Card,
  CardBody,
  Container,
  Heading,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
} from "@chakra-ui/react";
import { Center, Text } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { List, Loader } from "@saas-ui/react";
import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { bookCoverUrl } from "src/shared/utils";

dayjs.extend(localizedFormat);

const ExclusivesIndex = () => {
  return (
    <Container maxW="container.md">
      <Tabs isFitted>
        <TabList>
          <Tab>Premium Requests</Tab>
          <Tab>Approved Premium Books</Tab>
          <Tab>Rejected Premium Requests</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Exclusives />
          </TabPanel>
          <TabPanel p={0}>
            <ApprovedPremium />
          </TabPanel>
          <TabPanel p={0}>
            <RejectedPremium />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default ExclusivesIndex;

const Exclusives = () => {
  const exclusiveRequests = trpc.admin.exclusives.getExclusiveRequests.useQuery();
  const router = useRouter();

  if (exclusiveRequests.isLoading) return <Loader />;

  return (
    <div className="w-full mt-10">
      <Heading mb={5}>Exclusive Requests</Heading>
      {exclusiveRequests.data && exclusiveRequests.data.length ? (
        <Card w="full" bg="bg.card" shadow="lg">
          <CardBody>
            <List
              items={exclusiveRequests.data.map((item) => ({
                onClick: () =>
                  router.navigate({
                    to: "/app/books/$bookId",
                    params: { bookId: item.id.toString() },
                  }),
                href: `/app/books/${item.id}`,
                icon: (
                  <AspectRatio w="50px" ratio={4.25 / 6}>
                    <Image
                      src={bookCoverUrl(item.book_cover)}
                      fallbackSrc={`/api/fallback/${item.id}`}
                    />
                  </AspectRatio>
                ),
                primary: item.title,
                secondary: item.user.name,
                flexWrap: "wrap",
                tertiary: <Tag>{item.views} Views</Tag>,
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

const ApprovedPremium = () => {
  const premiumBooks = trpc.admin.exclusives.getApprovedPremiumBooks.useQuery();
  const router = useRouter();

  if (premiumBooks.isLoading) return <Loader />;

  return (
    <div className="w-full mt-10">
      <Heading mb={5}>Premium Books</Heading>
      {premiumBooks.data && premiumBooks.data.length ? (
        <Card w="full" bg="bg.card" shadow="lg">
          <CardBody>
            <List
              items={premiumBooks.data.map((item) => ({
                onClick: () =>
                  router.navigate({
                    to: "/app/books/$bookId",
                    params: { bookId: item.id.toString() },
                  }),
                href: `/app/books/${item.id}`,
                icon: (
                  <AspectRatio w="50px" ratio={4.25 / 6}>
                    <Image
                      src={bookCoverUrl(item.book_cover)}
                      fallbackSrc={`/api/fallback/${item.id}`}
                    />
                  </AspectRatio>
                ),
                primary: item.title,
                secondary: item.user.name,
                flexWrap: "wrap",
                tertiary: <Tag>{item.views} Views</Tag>,
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

const RejectedPremium = () => {
  const exclusiveRequests = trpc.admin.exclusives.getRejectedPremiumBooks.useQuery();
  const router = useRouter();

  if (exclusiveRequests.isLoading) return <Loader />;

  return (
    <div className="w-full mt-10">
      <Heading mb={5}>Rejected Premium Requests</Heading>
      {exclusiveRequests.data && exclusiveRequests.data.length ? (
        <Card w="full" bg="bg.card" shadow="lg">
          <CardBody>
            <List
              items={exclusiveRequests.data.map((item) => ({
                onClick: () =>
                  router.navigate({
                    to: "/app/books/$bookId",
                    params: { bookId: item.id.toString() },
                  }),
                href: `/app/books/${item.id}`,
                icon: (
                  <AspectRatio w="50px" ratio={4.25 / 6}>
                    <Image
                      src={bookCoverUrl(item.book_cover)}
                      fallbackSrc={`/api/fallback/${item.id}`}
                    />
                  </AspectRatio>
                ),
                primary: item.title,
                secondary: item.user.name,
                flexWrap: "wrap",
                tertiary: <Tag>{item.views} Views</Tag>,
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
