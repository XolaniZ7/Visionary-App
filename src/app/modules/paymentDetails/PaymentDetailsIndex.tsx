import { Center, Container, Heading, Text, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Loader } from "@saas-ui/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

const PaymentDetailsIndex = () => {
  const tips = trpc.author.paymentDetails.getAll.useQuery();

  if (tips.isLoading) return <Loader variant="overlay" />;

  return (
    <Container maxW="container.lg">
      <Heading mb={5}>Payment Details</Heading>
      {tips.data && tips.data.length ? (
        <TableContainer>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Amount</Th>
                <Th>Type</Th>
                <Th isNumeric>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tips.data.map((tip) => (
                <Tr key={tip.id}>
                  <Td>{tip.adminName}</Td>
                  <Td>R{tip.amount}</Td>
                  <Td>{tip.type}</Td>
                  <Td isNumeric>{dayjs(tip.created_at).format("L")}</Td>
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

export default PaymentDetailsIndex;
