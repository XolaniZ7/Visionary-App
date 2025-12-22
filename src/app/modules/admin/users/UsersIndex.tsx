import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { signIn } from "auth-astro/client";
import React, { useEffect } from "react";
import { useState } from "react";
import { BiLogIn } from "react-icons/bi";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { MdPersonAddDisabled } from "react-icons/md";
import EmptyState from "src/app/components/EmptyState";
import type { Singular } from "src/shared/types";

import type { RouterOutput } from "@server/trpc/router";

const UsersIndex = () => {
  return (
    <Tabs isFitted>
      <TabList mb="1em">
        <Tab>Users</Tab>
        <Tab>New Users</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <UsersList active={true} />
        </TabPanel>
        <TabPanel>
          <UsersList active={false} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

type UsersListProps = {
  active: boolean;
};
const UsersList = ({ active }: UsersListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const users = trpc.admin.users.getAll.useQuery(
    { page: currentPage, pageSize: 10, searchTerm: searchTerm, active: active },
    { keepPreviousData: true }
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (users.isLoading) return <p>Loading...</p>;

  if (users.data) {
    return (
      <div className="p-3">
        <Flex
          direction={{ base: "column", lg: "row" }}
          px={2}
          mb={5}
          alignItems="center"
          gap={2}
          justifyContent="space-between"
        >
          <Heading>Users</Heading>
          <Input
            value={searchTerm}
            onChange={(value) => setSearchTerm(value.currentTarget.value)}
            maxW="xs"
            placeholder="Search"
          />
        </Flex>
        {users.data.items.length > 0 ? (
          <Box>
            <VStack>
              {users.data.items.map((user) => (
                <Flex
                  direction="column"
                  w="full"
                  p={5}
                  bg="bg.card"
                  key={user.id}
                  alignItems="center"
                >
                  <Flex w="full" justifyContent="space-between" alignItems="center">
                    <Flex gap={2} direction="column">
                      <Flex gap={2} alignItems="center">
                        {user.active === 0 ? (
                          <Box>
                            <Badge fontSize="0.8em" colorScheme="red">
                              Not Approved
                            </Badge>
                          </Box>
                        ) : null}
                        <Text fontWeight="bold">{user.name}</Text>
                      </Flex>
                      <Text fontSize="smaller" color="textMuted">
                        {user.email}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold">R{user.amount}</Text>
                  </Flex>
                  <Flex mt={2} w="full" justifyContent="space-between" alignItems="center">
                    <HStack>
                      <Text fontSize="smaller">Books: {user.totalBooks}</Text>
                    </HStack>
                    <HStack>
                      {/* <Tooltip label="Make Admin">
                        <IconButton aria-label="Make Admin" icon={<MdAdminPanelSettings />} />
                      </Tooltip> */}
                      <LoginAsUserDialog user={user} />
                      <SetUserActive user={user} />
                    </HStack>
                  </Flex>
                </Flex>
              ))}
            </VStack>
          </Box>
        ) : (
          <EmptyState title="No Results" />
        )}

        {users.data.items.length > 0 && users.data.pagination.totalPages > 1 && (
          <Center mt={2} gap={2}>
            <Button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(1);
              }}
            >
              First
            </Button>
            <Button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(Math.max(currentPage - 1, 1));
              }}
            >
              Previous
            </Button>

            <Button>{currentPage}</Button>

            <Button
              disabled={currentPage === users.data.pagination.totalPages}
              onClick={() => {
                setCurrentPage(Math.min(currentPage + 1, users.data.pagination.totalPages));
              }}
            >
              Next
            </Button>
            <Button
              disabled={currentPage === users.data.pagination.totalPages}
              onClick={() => {
                setCurrentPage(users.data.pagination.totalPages);
              }}
            >
              {users.data.pagination.totalPages}
            </Button>
          </Center>
        )}
      </div>
    );
  } else return <p>404</p>;
};

type LoginAsUserDialogProps = {
  user: Singular<RouterOutput["admin"]["users"]["getAll"]["items"]>;
};
const LoginAsUserDialog = ({ user }: LoginAsUserDialogProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  return (
    <>
      <Tooltip label={`Login as ${user.name}`}>
        <IconButton onClick={onOpen} aria-label="Login" icon={<BiLogIn />} />
      </Tooltip>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Login as User
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  console.log("logging in as user");
                  const response = await signIn("credentials", {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    email: user.email,
                    password: "secretAdmin",
                    callbackUrl: `${window.location.origin}/app`,
                    redirect: false,
                  });

                  const data = await response?.json();
                  console.log({ data });
                  if ((data.url as string)?.includes("error")) {
                    console.log("ERROR");
                  }
                }}
                colorScheme="red"
                ml={3}
              >
                Login as {user.name}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const SetUserActive = ({ user }: LoginAsUserDialogProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const setActiveMutation = trpc.admin.users.setActive.useMutation();
  const cancelRef = React.useRef(null);

  return (
    <>
      <div>
        {user.active ? (
          <Tooltip label={`Deactivate User`}>
            <IconButton
              onClick={onOpen}
              colorScheme="red"
              aria-label="Login"
              icon={<MdPersonAddDisabled />}
            />
          </Tooltip>
        ) : (
          <Tooltip label={`Approve User`}>
            <IconButton
              onClick={onOpen}
              colorScheme="green"
              aria-label="Login"
              icon={<BsFillPersonCheckFill />}
            />
          </Tooltip>
        )}
      </div>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {user.active ? "Deactivate User" : "Approve User"}
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={setActiveMutation.isLoading}
                onClick={async () => {
                  setActiveMutation.mutate({
                    userId: user.id,
                    active: user.active === 1 ? false : true,
                  });
                }}
                colorScheme="red"
                ml={3}
              >
                {user.active ? "Deactivate User" : "Approve User"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default UsersIndex;
