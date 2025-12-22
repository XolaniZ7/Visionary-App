//import { vanillaTrpc } from "@client/utils";
import LoadingState from "@components/LoadingState";
import { createRouter, RoutePaths } from "@tanstack/react-router";

import {
  adminAdDetailsRoute,
  adminAdsCreateRoute,
  adminAdsIndexRoute,
  adminAdsRoute,
} from "./modules/admin/ads/routes";
import { adminEmailIndexRoute, adminEmailRoute } from "./modules/admin/email/routes";
import { adminExclusivesIndexRoute, adminExclusivesRoute } from "./modules/admin/exclusives/routes";
import {
  adminManagePayfastIndexRoute,
  adminManagePayfastRoute,
} from "./modules/admin/managePayfast/routes";
import { adminPayIndexRoute, adminPayRoute, adminPayUserRoute } from "./modules/admin/pay/routes";
import {
  adminRestrictionsIndexRoute,
  adminRestrictionsRoute,
} from "./modules/admin/restrictions/routes";
import { adminRoute } from "./modules/admin/routes";
import { adminUsersIndexRoute, adminUsersRoute } from "./modules/admin/users/routes";
import { bankDetailsIndexRoute, bankDetailsRoute } from "./modules/bankDetails/routes";
import { billingIndexRoute, billingRoute } from "./modules/billing/routes";
import {
  bookDetailsIndexRoute,
  bookDetailsRoute,
  booksIndexRoute,
  booksRoute,
  createBooksRoute,
} from "./modules/books/routes";
import { chaptersRoute, createChaptersRoute, editChaptersRoute } from "./modules/chapters/routes";
import { commentsIndexRoute, commentsRoute } from "./modules/comments/routes";
import { dashboardRoute, indexRoute, rootRoute } from "./modules/dashboard/routes";
import { monthlyEarningsIndexRoute, monthlyEarningsRoute } from "./modules/monthlyEarnings/routes";
import { paymentDetailsIndexRoute, paymentDetailsRoute } from "./modules/paymentDetails/routes";
import { paymentRequestsIndexRoute, paymentRequestsRoute } from "./modules/paymentRequests/routes";
import { profileIndexRoute, profileRoute } from "./modules/profile/routes";
import { tipsIndexRoute, tipsRoute } from "./modules/tips/routes";

// Build the route tree with all routes registered
const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([
    dashboardRoute,
    bankDetailsRoute.addChildren([bankDetailsIndexRoute]),
    tipsRoute.addChildren([tipsIndexRoute]),
    monthlyEarningsRoute.addChildren([monthlyEarningsIndexRoute]),
    paymentDetailsRoute.addChildren([paymentDetailsIndexRoute]),
    paymentRequestsRoute.addChildren([paymentRequestsIndexRoute]),
    profileRoute.addChildren([profileIndexRoute]),
    billingRoute.addChildren([billingIndexRoute]),
    commentsRoute.addChildren([commentsIndexRoute]),
    booksRoute.addChildren([
      booksIndexRoute,
      createBooksRoute,
      bookDetailsRoute.addChildren([
        bookDetailsIndexRoute,
        chaptersRoute.addChildren([createChaptersRoute, editChaptersRoute]),
      ]),
    ]),
    adminRoute.addChildren([
      adminUsersRoute.addChildren([adminUsersIndexRoute]),
      adminManagePayfastRoute.addChildren([adminManagePayfastIndexRoute]),
      adminAdsRoute.addChildren([adminAdsIndexRoute, adminAdsCreateRoute, adminAdDetailsRoute]),
      adminRestrictionsRoute.addChildren([adminRestrictionsIndexRoute]),
      adminEmailRoute.addChildren([adminEmailIndexRoute]),
      adminPayRoute.addChildren([adminPayIndexRoute, adminPayUserRoute]),
      adminExclusivesRoute.addChildren([adminExclusivesIndexRoute]),
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: false,
  defaultPendingComponent: LoadingState,
  basepath: '/',
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export type AllRoutePaths = RoutePaths<typeof routeTree>;
