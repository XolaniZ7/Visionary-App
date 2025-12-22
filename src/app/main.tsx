import { ColorModeScript, createLocalStorageManager } from "@chakra-ui/react";
import { ModalsProvider, SaasProvider } from "@saas-ui/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import type { ReactNode } from "react";

import TrpcWrapper from "./components/TrpcWrapper";
import BillingIndex from "./modules/billing/BillingIndex";
import { router } from "./routes";
import { theme } from "./theme";

const manager = createLocalStorageManager("theme");

const App = () => {
  return (
    <TrpcWrapper>
      <SaasProvider colorModeManager={manager} theme={theme}>
        <ModalsProvider>
          <ReactQueryDevtools />
          <RouterProvider router={router} />
          <ColorModeScript storageKey="theme" initialColorMode={"dark"} />
        </ModalsProvider>
      </SaasProvider>
    </TrpcWrapper>
  );
};

type AppWrapperProps = {
  children: ReactNode;
};
export const AppWrapper = ({ children }: AppWrapperProps) => {
  return (
    <TrpcWrapper>
      <SaasProvider colorModeManager={manager} theme={theme}>
        {children}
        <ColorModeScript storageKey="theme" initialColorMode={"dark"} />
      </SaasProvider>
    </TrpcWrapper>
  );
};

export const BillingWrapper = () => {
  return (
    <AppWrapper>
      <BillingIndex />
    </AppWrapper>
  );
};

export default App;
