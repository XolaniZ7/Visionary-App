import { Container, Heading, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import EmptyState from "src/app/components/EmptyState";

dayjs.extend(localizedFormat);

const TipsIndex = () => {
  const tips = trpc.author.tips.getAll.useQuery();
  if (tips.isLoading) return <p>Loading...</p>;
  if (tips.data && tips.data.length) {
    return (
      <Container maxW="container.lg">
        <Heading mb={5}>Tips</Heading>
        <TableContainer>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Tipper Name</Th>
                <Th>Cost</Th>
                <Th isNumeric>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tips.data.map((tip) => (
                <Tr key={tip.id}>
                  <Td>{tip.customer_name.split(" ")[0]}</Td>
                  <Td>R{tip.cost}</Td>
                  <Td isNumeric>{dayjs(tip.created_at).format("L")}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

  return <EmptyState title="No Tips" />;
};

export default TipsIndex;
