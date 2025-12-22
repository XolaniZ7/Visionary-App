import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import AdDetails from "./AdDetails";
import AdsCreate from "./AdsCreate";
import AdsIndex from "./AdsIndex";

export const adminAdsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "ads",
});
export const adminAdsIndexRoute = createRoute({
    getParentRoute: () => adminAdsRoute,
    path: "/",
    component: AdsIndex,
});

export const adminAdsCreateRoute = createRoute({
    getParentRoute: () => adminAdsRoute,
    path: "create",
    component: AdsCreate,
});

export const adminAdDetailsRoute = createRoute({
    getParentRoute: () => adminAdsRoute,
    path: "$adId",
    component: AdDetails,
});