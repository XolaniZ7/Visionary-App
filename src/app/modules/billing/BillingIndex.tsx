import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { Loader } from "@saas-ui/react";
import { useRef } from "react";

import PricingCards from "./PricingCards";
import "./billingStyles.scss";

const BillingIndex = () => {
  const subscriptionStatus = trpc.billing.getSubscriptionStatus.useQuery();
  const validSubscriptions = trpc.billing.getValidSubscriptions.useQuery();

  if (subscriptionStatus.isLoading || validSubscriptions.isLoading)
    return (
      <Box minHeight="100vh" position="relative">
        <Loader />
      </Box>
    );

  if (subscriptionStatus.data && validSubscriptions.data && Array.isArray(validSubscriptions.data)) {
    return (
      <Box p={5}>
        <div className="flex flex-col gap-3">
          {validSubscriptions.data.map((subscription) => (
            <div key={subscription.id}>
              <div className="billing-cards-container">
                <div className="billing-card Plan-info bg-base-300">
                  <div>
                    <div className="pricing-info">
                      <p className="price text-base-content">
                        <span>R</span>
                        {subscription.amount / 100}
                      </p>
                      <span className="frequency">
                        {subscription.payments_subscription_frequency.extension_name}
                      </span>
                    </div>
                    {subscription.status_id == 1 ? (
                      <div>
                        <CancelSubscriptionModal token={subscription.token} />

                        <form
                          id="cancelSubscriptionForm-{{ subscription.token }}"
                          action="/payments/cancel-subscription"
                          method="post"
                        >
                          <input name="token" type="hidden" value={subscription.token} />
                        </form>

                        <form
                          id="pauseSubscriptionForm-{{ subscription.token }}"
                          action="/payments/unpause-subscription"
                          method="post"
                        >
                          <input name="token" type="hidden" value={subscription.token} />
                        </form>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary btn-lg" disabled>
                        Cancelled
                      </button>
                    )}
                  </div>
                  <div className="plan-wrapper">
                    <p className="plan-heading text-base-content">
                      <span>{subscription.payments_subscription_frequency.name}</span>
                      Plan
                    </p>
                  </div>
                </div>
                <div className="billing-card Next-payment bg-base-300">
                  <div>
                    {subscription.status_id == 1 ? (
                      <div>
                        <p className="next-payment-heading text-base-content">Next Payment</p>
                        <p className="text-base-content">
                          on {subscription.run_date.toDateString()}
                        </p>
                      </div>
                    ) : subscription.status_id == 7 ? (
                      <div>
                        <p className="next-payment-heading text-base-content">
                          This plan has been renewed.
                        </p>
                        <p className="text-base-content">
                          on {subscription.run_date.toDateString()}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="next-payment-heading text-base-content">
                          This plan has been cancelled
                        </p>
                        <p className="text-base-content">
                          Valid until {subscription.run_date.toDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* {subscription.status_id == 1 ? (
                    <button type="button" className="btn btn-secondary btn-lg" disabled>
                      Update Card Information
                    </button>
                  ) : (
                    <button type="button" className="btn btn-secondary btn-lg" disabled>
                      Update Card Information
                    </button>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>
        {subscriptionStatus.data.canOrderNewSubscription && (
          <div className="mt-3">
            {subscriptionStatus.data.hasValidSubscriptionResult ? (
              <PricingCards renew={true} />
            ) : (
              <div>
                <PricingCards />
              </div>
            )}
          </div>
        )}
      </Box>
    );
  } else return null;
};

type CancelSubscriptionModalProps = {
  token: string;
};
const CancelSubscriptionModal = ({ token }: CancelSubscriptionModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const toast = useToast();
  const cancelSubscriptionMutation = trpc.billing.cancelSubscription.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your subscription has been cancelled",
        status: "success",
        isClosable: true,
        position: "top-right",
      });
    },
  });

  return (
    <>
      <Button onClick={onOpen} variant="ghost" colorScheme="red">
        Cancel
      </Button>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Subscription
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure you want to cancel your subscription?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Nevermind
              </Button>
              <Button
                isLoading={cancelSubscriptionMutation.isLoading}
                colorScheme="red"
                onClick={() => cancelSubscriptionMutation.mutate({ token })}
                ml={3}
              >
                Cancel Subscription
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default BillingIndex;
