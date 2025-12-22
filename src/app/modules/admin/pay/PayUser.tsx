import EmptyState from "@app/components/EmptyState";
import SaveChangesButton from "@app/components/SaveChangesButton";
import { Button, Container, Flex, Heading, Text } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { zodForm } from "@saas-ui/forms/zod";
import { BannerActions, Loader } from "@saas-ui/react";
import {
  AutoForm,
  Banner,
  BannerIcon,
  BannerTitle,
  Card,
  CardBody,
  Property,
  PropertyList,
} from "@saas-ui/react";
import { useMatch, useSearch } from "@tanstack/react-router";
import { prettyDate } from "src/shared/utils";
import { z } from "zod";

import { adminPayUserRoute } from "./routes";

const PayUser = () => {
  const { params } = useMatch({ from: adminPayUserRoute.id });
  const { paymentRequestId } = useSearch({ from: adminPayUserRoute.id });
  const userId = z.coerce.number().parse(params.userId);
  const user = trpc.admin.pay.getAuthorWallet.useQuery({ userId });
  const currentUser = trpc.getCurrentUser.useQuery();
  const payAuthor = trpc.admin.pay.payAuthor.useMutation();
  const paymentRequest = paymentRequestId
    ? trpc.admin.paymentRequest.get.useQuery({ paymentRequestId })
    : null;

  if (user.isLoading || currentUser.isLoading) return <Loader />;
  if (!user.data || !currentUser.data) return <EmptyState title="Nothing here" />;

  const authorWallet = parseFloat(user.data.userInfo.amount);
  const amountToPay = paymentRequest?.data?.amount
    ? parseFloat(paymentRequest.data.amount.toString())
    : parseFloat(user.data.userInfo.amount);
  const adminWallet = parseFloat(currentUser.data.amount.toString());
  const haveEnough = adminWallet > amountToPay;

  const schema = z.object({
    amount: z.coerce.number().min(0).max(authorWallet).describe("Payment Amount"),
  });

  return (
    <Container maxW="container.md">
      <Flex direction="column" gap={2}>
        <Heading mb={4}>Pay User</Heading>
        <Card title="Author details">
          <CardBody>
            <PropertyList>
              <Property
                label="Name"
                value={<Text fontWeight="bold">{user.data.userInfo.name}</Text>}
              />
              <Property label="Email" value={user.data.userInfo.email} />
              {paymentRequest?.data && (
                <Property label="Request Date" value={prettyDate(paymentRequest.data.created_at)} />
              )}
              <Property
                label="Author Wallet Amount"
                value={`R${parseFloat(user.data.userInfo.amount).toFixed(2)}`}
              />

              {paymentRequest?.data?.amount && (
                <Property
                  label="Payment Request Amount"
                  value={`R${parseFloat(paymentRequest.data.amount.toString()).toFixed(2)}`}
                />
              )}
              <Property
                label="Your Wallet Amount"
                value={`R${parseFloat(currentUser.data.amount.toString()).toFixed(2)}`}
              />
              <Property label="Have Enough Money" value={haveEnough ? "Yes" : "No"} />
            </PropertyList>
            {payAuthor.isSuccess ? (
              <Banner rounded="md" status="success">
                <BannerIcon />
                <BannerTitle>Payment has been made successfully</BannerTitle>
                <BannerActions justifySelf="flex-end">
                  <Button onClick={() => payAuthor.reset()} colorScheme="green">
                    Make Another Payment
                  </Button>
                </BannerActions>
              </Banner>
            ) : authorWallet <= 0 || !haveEnough ? (
              <Banner rounded="md" status="error">
                <BannerIcon />
                <BannerTitle>Cannot Make Payment</BannerTitle>
              </Banner>
            ) : (
              <AutoForm
                defaultValues={{
                  amount: amountToPay,
                }}
                submitLabel={null}
                {...zodForm(schema)}
                onSubmit={(v) =>
                  payAuthor.mutate({
                    userId: userId,
                    amount: v.amount,
                    paymentRequestId: paymentRequest?.data?.id,
                  })
                }
              >
                <SaveChangesButton
                  text="Pay Author"
                  isLoading={payAuthor.isLoading}
                  colorScheme="green"
                  bg={undefined}
                />
              </AutoForm>
            )}
          </CardBody>
        </Card>
        {user.data.bankDetail ? (
          <Card title="Bank details">
            <CardBody>
              <PropertyList>
                <Property
                  label="Bank Name"
                  value={<Text fontWeight="bold">{user.data.bankDetail.bankName}</Text>}
                />
                <Property
                  label="Account Number"
                  value={<Text fontWeight="bold">{user.data.bankDetail.accountNumber}</Text>}
                />
                <Property
                  label="Branch"
                  value={<Text fontWeight="bold">{user.data.bankDetail.branch}</Text>}
                />
                <Property
                  label="Name"
                  value={<Text fontWeight="bold">{user.data.bankDetail.name}</Text>}
                />
                <Property
                  label="Surname"
                  value={<Text fontWeight="bold">{user.data.bankDetail.surname}</Text>}
                />
              </PropertyList>
            </CardBody>
          </Card>
        ) : (
          <Banner rounded="md" status="error">
            <BannerIcon />
            <BannerTitle>User has no bank details</BannerTitle>
          </Banner>
        )}
      </Flex>
    </Container>
  );
};

export default PayUser;
