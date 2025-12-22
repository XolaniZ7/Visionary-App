import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Loader, useModals, useSnackbar } from "@saas-ui/react";
import { useRouter } from "@tanstack/react-router";
import { ArrowCircleRight, Wallet } from "phosphor-react";
import type { ReactNode } from "react";
import { BiBarChart } from "react-icons/bi";
import { usePrimaryColorScheme } from "src/app/theme";

interface StatsCardProps {
  title: string;
  stat: string;
  icon: ReactNode;
}
function StatsCard(props: StatsCardProps) {
  const { title, stat, icon } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"xl"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <Flex justifyContent={"space-between"}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
            {stat}
          </StatNumber>
        </Box>
        <Box my={"auto"} color={useColorModeValue("gray.800", "gray.200")} alignContent={"center"}>
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
}

export default function BasicStatistics() {
  const primaryColorScheme = usePrimaryColorScheme();
  const getBookCountByUser = trpc.author.getBookCountByUser.useQuery();
  const currentUser = trpc.getCurrentUser.useQuery();
  const modals = useModals();
  const snackbar = useSnackbar();
  const paymentRequest = trpc.paymentRequest.create.useMutation();
  const bankDetails = trpc.author.bankDetails.get.useQuery();
  const router = useRouter();

  if (getBookCountByUser.isLoading || currentUser.isLoading) return <Loader variant="overlay" />;
  if (!currentUser.data || !getBookCountByUser.data) return null;

  return (
    <Box maxW="container.lg" w="full" px={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={"Total Book Views"}
          stat={
            getBookCountByUser.isLoading ? "..." : getBookCountByUser.data.count.toString() ?? "0"
          }
          icon={<BiBarChart size={"3em"} />}
        />
        <StatsCard
          title={"Wallet Balance"}
          stat={currentUser.data?.amount.toString() ?? "0"}
          icon={<Wallet size={"3em"} />}
        />
        <Button
          colorScheme={primaryColorScheme}
          bg={"primary"}
          rightIcon={<ArrowCircleRight size={25} weight="fill" />}
          h="full"
          minH="100px"
          onClick={() =>
            modals.confirm({
              title: bankDetails.data ? "Request Payment" : "No Bank Details",
              closeOnConfirm: false,

              body: bankDetails.data
                ? `Are you sure you want to request payment for R${currentUser.data.amount.toString()}`
                : "Please first update your bank details before requesting payment",
              confirmProps: {
                colorScheme: "green",
                label: bankDetails.data ? "Request Payment" : "Add Bank Details",
                isLoading: paymentRequest.isLoading,
              },
              onConfirm: () => {
                if (bankDetails.data) {
                  paymentRequest.mutate(
                    {
                      amount: parseFloat(currentUser.data.amount.toString()),
                    },
                    {
                      onSuccess: () => {
                        snackbar.success("Your payment request has been submitted successfully");
                      },
                      onSettled: () => {
                        modals.closeAll();
                      },
                    }
                  );
                } else {
                  router.navigate({ to: "/app/bankDetails" });
                  modals.closeAll();
                }
              },
            })
          }
        >
          Request Payment
        </Button>
      </SimpleGrid>
    </Box>
  );
}
