import { Center, Container, Heading, Text, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Loader } from "@saas-ui/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

const PaymentDetailsIndex = () => {
  const paymentRequests = trpc.paymentRequest.getAll.useQuery();

  if (paymentRequests.isLoading) return <Loader variant="overlay" />;

  return (
    <Container maxW="container.lg">
      <Heading mb={5}>Payment Requests</Heading>
      {paymentRequests.data && paymentRequests.data.length ? (
        <TableContainer>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Status</Th>
                <Th>Amount</Th>

                <Th isNumeric>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paymentRequests.data.map((paymentRequest) => (
                <Tr key={paymentRequest.id}>
                  <Td>{paymentRequest.status}</Td>
                  <Td>R{paymentRequest.amount.toString()}</Td>

                  <Td isNumeric>{dayjs(paymentRequest.created_at).format("L")}</Td>
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
