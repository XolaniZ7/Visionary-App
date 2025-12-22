import { trpc } from "@client/utils";
import { useMatch } from "@tanstack/react-router";
import { z } from "zod";

import AdsCreate from "./AdsCreate";
import { adminAdDetailsRoute } from "./routes";

const AdDetails = () => {
  const match = useMatch({ from: adminAdDetailsRoute.id });
  const adId = z.coerce.number().parse(match.params.adId);
  const ad = trpc.admin.ads.get.useQuery({ adId });

  if (ad.isLoading) return <p>Loading...</p>;
  if (ad.data) {
    return (
      <div>
        <AdsCreate ad={ad.data} />
      </div>
    );
  }

  return <p>404</p>;
};

export default AdDetails;
