import { Center, Container, Heading, Text, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Loader } from "@saas-ui/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

const MonthlyEarnings = () => {
  const monthlyEarnings = trpc.author.monthlyEarnings.getAll.useQuery();
  if (monthlyEarnings.isLoading) return <Loader variant="overlay" />;

  return (
    <Container maxW="container.lg">
      <Heading mb={5}>Monthly Earnings</Heading>
      {monthlyEarnings.data && monthlyEarnings.data.length ? (
        <TableContainer>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Month</Th>
                <Th>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {monthlyEarnings.data.map((element) => (
                <Tr key={element.monthyear}>
                  <Td>{element.monthyear}</Td>
                  <Td>R{element.amount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Center p={10} border="1px solid" borderColor="primary">
          <Text>No Data</Text>
        </Center>
      )}
    </Container>
  );
};

export default MonthlyEarnings;
