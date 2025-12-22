import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Image,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Loader } from "@saas-ui/react";
import type { ReactNode } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { usePrimaryColorScheme } from "src/app/theme";

type PriceWrapperProps = {
  children: ReactNode;
};
function PriceWrapper({ children }: PriceWrapperProps) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}

type ThreeTierPricingProps = {
  renew?: boolean;
};
export default function ThreeTierPricing({ renew = false }: ThreeTierPricingProps) {
  const primaryColorScheme = usePrimaryColorScheme();
  const subscriptionInfo = trpc.billing.getSubscriptionInfo.useQuery();

  if (subscriptionInfo.isLoading) return <Loader />;
  if (!subscriptionInfo.data) return <p>404</p>;
  return (
    <Box py={12}>
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="4xl" mb={3}>
          <Box
            bgClip="text"
            bgGradient={useColorModeValue(
              "linear(to-l, #1e3d99, #805ad5)",
              "linear(to-l, #dae564, #ff9f01)"
            )}
            as="span"
          >
            Join Visionary Writings
            <Box fontFamily={`'Dancing Script', cursive`} as="span">
              Plus+
            </Box>
          </Box>
        </Heading>
        <Text fontSize="lg" color={"gray.500"}>
          Subscribe with Payfast. Cancel at anytime.
        </Text>
      </VStack>
      <Stack
        direction={{ base: "column", md: "row" }}
        textAlign="center"
        justify="center"
        spacing={{ base: 4, lg: 10 }}
        py={10}
      >
        <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Monthly Maverick
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                R
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                {subscriptionInfo.data.monthlyCost.toFixed(2)}
              </Text>
              <Text fontSize="xl" color="gray.500">
                /month
              </Text>
            </HStack>
          </Box>
          <VStack bg="bg.card" py={4} borderBottomRadius={"xl"}>
            <List spacing={3} textAlign="start" px={12}>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Enjoy an ad-free experience
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Conserve data usage for other tasks
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Experience lightning-fast loading times
              </ListItem>
            </List>
            <Box w="80%" pt={7}>
              <Button
                as="a"
                href="/subscribe?plan=monthly"
                target="_blank"
                w="full"
                colorScheme={primaryColorScheme}
                color="primary"
                variant="outline"
              >
                Subscribe
              </Button>
            </Box>
          </VStack>
        </PriceWrapper>

        <PriceWrapper>
          <Box position="relative">
            <Box
              position="absolute"
              top="-16px"
              left="50%"
              style={{ transform: "translate(-50%)" }}
            >
              <Text
                textTransform="uppercase"
                bg="purple.500"
                px={3}
                py={1}
                color="white"
                fontSize="sm"
                fontWeight="600"
                rounded="xl"
              >
                Most Popular
              </Text>
            </Box>
            <Box py={4} px={12}>
              <Text mt={3} fontWeight="500" fontSize="2xl">
                Half-Year Hero
              </Text>
              <HStack justifyContent="center">
                <Text fontSize="3xl" fontWeight="600">
                  R
                </Text>
                <Text fontSize="5xl" fontWeight="900">
                  {subscriptionInfo.data.biannuallyCost.toFixed(2)}
                </Text>
                <Text fontSize="xl" color="gray.500">
                  /biannually
                </Text>
              </HStack>
              <Text
                color={useColorModeValue("purple.600", "yellow.200")}
                mt={1}
                fontWeight="600"
                fontSize="lg"
              >
                Save {subscriptionInfo.data.biannualDiscount.toFixed(2)}% (R
                {subscriptionInfo.data.biannualDiscountSavings.toFixed(2)})
              </Text>
            </Box>
            <VStack bg="bg.card" py={4} borderBottomRadius={"xl"}>
              <List spacing={3} textAlign="start" px={12}>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Enjoy an ad-free experience
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Conserve data usage for other tasks
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Experience lightning-fast loading times
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="yellow.500" />
                  Be the first to access exclusive, cutting-edge features
                </ListItem>
              </List>
              <Box w="80%" pt={7}>
                <Button
                  as="a"
                  href="/subscribe?plan=biannually"
                  target="_blank"
                  w="full"
                  colorScheme={primaryColorScheme}
                  bg="primary"
                >
                  Subscribe
                </Button>
              </Box>
            </VStack>
          </Box>
        </PriceWrapper>
        <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Annual All-Star
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                R
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                {subscriptionInfo.data.yearlyCost.toFixed(2)}
              </Text>
              <Text fontSize="xl" color="gray.500">
                /year
              </Text>
            </HStack>
            <Text
              color={useColorModeValue("purple.600", "yellow.200")}
              mt={1}
              fontWeight="600"
              fontSize="lg"
            >
              Save {subscriptionInfo.data.yearlyDiscount}% (R
              {subscriptionInfo.data.yearlyDiscountSavings.toFixed(2)})
            </Text>
          </Box>

          <VStack bg="bg.card" py={4} borderBottomRadius={"xl"}>
            <List spacing={3} textAlign="start" px={12}>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                All the benefits of Half-Year Hero
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="yellow.500" />
                Priority support and feature request
              </ListItem>
            </List>
            <Box w="80%" pt={7}>
              <Button
                as="a"
                href="/subscribe?plan=yearly"
                target="_blank"
                w="full"
                colorScheme={primaryColorScheme}
                color="primary"
                variant="outline"
              >
                Subscribe
              </Button>
            </Box>
          </VStack>
        </PriceWrapper>
      </Stack>
      <Center>
        <Image
          w={40}
          src={useColorModeValue(
            "/payfastLogos/Payfast By Network_dark.png",
            "/payfastLogos/Payfast By Network_light.png"
          )}
        />
      </Center>
    </Box>
  );
}
