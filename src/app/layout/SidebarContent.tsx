import {
  Box,
  Center,
  Icon,
  IconButton,
  Image,
  List,
  ListIcon,
  MenuItem,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ListItem } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { trpc } from "@client/utils";
import {
  ArrowBendDownRight,
  At,
  Bank,
  Books,
  Cardholder,
  ChatText,
  Coin,
  Coins,
  ContactlessPayment,
  FlowArrow,
  Kanban,
  Money,
  UserCircle,
  UserCircleGear,
  Wallet,
  Warning,
} from "@phosphor-icons/react";
import { Card, CardBody, MenuDialog, MenuDialogList, Persona } from "@saas-ui/react";
import { Link, useRouter } from "@tanstack/react-router";
import { signOut } from "auth-astro/client";
import type { ReactNode } from "react";
import { BiLogOutCircle } from "react-icons/bi";
import { MdSettings } from "react-icons/md";

import type { AllRoutePaths } from "../routes";
import { IsAdmin, IsAuthor, useIsAuthor } from "./AuthBlocks";

type SidebarContentProps = {
  sidebarOpen: boolean;
  toggleSidebarOpen: () => void;
};

export const SidebarContent = ({ sidebarOpen, toggleSidebarOpen }: SidebarContentProps) => {
  const isAuthor = useIsAuthor();
  const user = trpc.getCurrentUser.useQuery();
  const profile = trpc.profile.get.useQuery();
  const router = useRouter();

  return (
    <Box borderRight="1px solid" borderColor="muted" bg="bg.one" h={"full"} minH="100vh">
      <Box p={2} sx={{ position: "sticky", top: 0 }}>
        <Center p={5}>
          <Image w={100} src={useColorModeValue("/logo-vw-black.png", "/logo-vw-white.png")} />
        </Center>
        <Tabs isFitted>
          <TabList>
            <Tab>{isAuthor ? "Author" : "Reader"}</Tab>
            <IsAdmin>
              <Tab>Admin</Tab>
            </IsAdmin>
          </TabList>

          {user.data && profile.data && (
            <Card mt={2} variant="outline" bg="bg.three">
              <CardBody display="flex" justifyContent="space-between" alignItems="center">
                <Persona
                  src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/avatars/${profile.data.avatar}/Thumbnail`}
                  gap={3}
                  name={user.data.name}
                  wordBreak="break-all"
                />
                <UserMenu toggleSidebarOpen={toggleSidebarOpen} />
              </CardBody>
            </Card>
          )}

          <TabPanels>
            <TabPanel>
              <List display="flex" flexDirection="column" gap={2}>
                <a href="/">
                  <ListItem
                    display="flex"
                    alignItems="center"
                    rounded="2xl"
                    _hover={{ bg: "bg.two" }}
                    p={3}
                    fontWeight="semibold"
                  >
                    <ListIcon as={ArrowBendDownRight} boxSize={5} />
                    View Site
                  </ListItem>
                </a>
                <NavLink
                  icon={<ListIcon as={Kanban} boxSize={5} />}
                  url="/app"
                  text="Dashboard"
                  exact
                  toggleSidebarOpen={toggleSidebarOpen}
                />
                <NavLink
                  icon={<ListIcon as={ChatText} boxSize={5} />}
                  url="/app/comments"
                  text="Comments"
                  toggleSidebarOpen={toggleSidebarOpen}
                />
                <IsAuthor>
                  <NavLink
                    icon={<ListIcon as={Books} boxSize={5} />}
                    url="/app/books"
                    text="Books"
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Bank} boxSize={5} />}
                    url="/app/bankDetails"
                    text="Bank Details"
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Coin} boxSize={5} />}
                    url="/app/tips"
                    text="Tips"
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Wallet} boxSize={5} />}
                    url="/app/monthlyEarnings"
                    text="Monthly Earnings"
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Money} boxSize={5} />}
                    url="/app/paymentRequests"
                    text="Payment Requests"
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Money} boxSize={5} />}
                    url="/app/paymentDetails"
                    text="Payments"
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                </IsAuthor>
              </List>
            </TabPanel>

            <IsAdmin>
              <TabPanel>
                <List display="flex" flexDirection="column" gap={2}>
                  <NavLink
                    icon={<ListIcon as={UserCircle} boxSize={5} />}
                    url="/app/admin/users"
                    text="Users"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={ContactlessPayment} boxSize={5} />}
                    url="/app/admin/exclusives"
                    text="Exclusives"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={ContactlessPayment} boxSize={5} />}
                    url="/app/admin/pay"
                    text="Pay"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Coins} boxSize={5} />}
                    url="/app/admin/manage-payfast"
                    text="Manage Payfast"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={FlowArrow} boxSize={5} />}
                    url="/app/admin/ads"
                    text="Ads"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={Warning} boxSize={5} />}
                    url="/app/admin/restrictions"
                    text="Restrictions"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                  <NavLink
                    icon={<ListIcon as={At} boxSize={5} />}
                    url="/app/admin/email"
                    text="Email"
                    exact
                    toggleSidebarOpen={toggleSidebarOpen}
                  />
                </List>
              </TabPanel>
            </IsAdmin>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

type NavLinkProps = {
  text: string;
  url: AllRoutePaths;
  icon: ReactNode;
  exact?: boolean;
  toggleSidebarOpen: () => void;
};

export const NavLink = ({ text, url, icon, exact, toggleSidebarOpen }: NavLinkProps) => {
  return (
    <Link
      onClick={toggleSidebarOpen}
      to={url}
      activeOptions={{ exact }}
      activeProps={{ style: { textDecoration: "none" } }}
      inactiveProps={{ style: { textDecoration: "none" } }}
    >
      {({ isActive }) => (
        <ListItem
          display="flex"
          alignItems="center"
          rounded="2xl"
          bg={isActive ? "primary" : ""}
          _hover={{ bg: isActive ? "" : "bg.two" }}
          color={isActive ? "primaryText" : ""}
          p={3}
          fontWeight="semibold"
        >
          {icon}
          {text}
        </ListItem>
      )}
    </Link>
  );
};

function UserMenu({ toggleSidebarOpen }: { toggleSidebarOpen: () => void }) {
  const disclosure = useDisclosure();
  const router = useRouter();

  return (
    <>
      <IconButton
        onClick={disclosure.onOpen}
        variant="ghost"
        colorScheme="teal"
        aria-label="Settings"
        icon={<MdSettings />}
      />

      <MenuDialog {...disclosure}>
        <MenuDialogList p={3} title="Commands">
          <MenuItem
            onClick={() => {
              router.navigate({ to: "/app/profile" });
              toggleSidebarOpen();
            }}
            icon={<Icon boxSize={5} as={UserCircleGear} />}
          >
            Update Profile
          </MenuItem>
          <MenuItem icon={<Icon boxSize={5} as={BiLogOutCircle} />} onClick={() => signOut()}>
            Log Out
          </MenuItem>
        </MenuDialogList>
      </MenuDialog>
    </>
  );
}
