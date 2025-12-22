import { Box, Card, Container, Flex, VStack } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { List, ListItem, ListItemIcon, ListItemLabel, Loader, Persona } from "@saas-ui/react";
import { useRouter } from "@tanstack/react-router";
import { Cardholder } from "phosphor-react";
import { BiComment, BiHome } from "react-icons/bi";
import { RiProfileFill } from "react-icons/ri";
import { IsAuthor, IsReader } from "src/app/layout/AuthBlocks";

import MonthlyEarningsIndex from "../monthlyEarnings/MonthlyEarningsIndex";
import PaymentDetailsIndex from "../paymentDetails/PaymentDetailsIndex";
import PaymentRequestsIndex from "../paymentRequests/PaymentRequestsIndex";
import Stats from "./Stats";

const DashboardIndex = () => {
  const profile = trpc.profile.get.useQuery();
  const router = useRouter();
  if (profile.isLoading) return <Loader />;
  if (!profile.data) return null;
  return (
    <VStack spacing={8}>
      <IsAuthor>
        <Stats />
        <PaymentRequestsIndex />
        <MonthlyEarningsIndex />
        <PaymentDetailsIndex />
      </IsAuthor>
      <IsReader>
        <Container maxW="container.md">
          <Flex direction="column" gap={8}>
            <Persona
              src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/avatars/${profile.data.avatar}/Thumbnail`}
              name={profile.data.name}
              secondaryLabel={profile.data.email}
              size="xl"
            />
            <Card width="100%">
              <Box as="nav">
                <List>
                  <ListItem as="a" href="/">
                    <ListItemIcon as={BiHome} />
                    <ListItemLabel primary="Home" secondary="Lets get back to some great stories" />
                  </ListItem>
                  <ListItem onClick={() => (router.navigate as any)({ to: "/app/comments" })}>
                    <ListItemIcon as={BiComment} />
                    <ListItemLabel
                      primary="Comments"
                      secondary="View and manage the comments that you have posted"
                    />
                  </ListItem>
                  <ListItem onClick={() => (router.navigate as any)({ to: "/app/billing" })}>
                    <ListItemIcon as={Cardholder} />
                    <ListItemLabel primary="Billing" secondary="Manage your PRO subscriptions" />
                  </ListItem>
                  <ListItem onClick={() => (router.navigate as any)({ to: "/app/profile" })}>
                    <ListItemIcon as={RiProfileFill} />
                    <ListItemLabel primary="Profile" secondary="View and edit your profile" />
                  </ListItem>
                </List>
              </Box>
            </Card>
          </Flex>
        </Container>
      </IsReader>
    </VStack>
  );
};

export default DashboardIndex;
