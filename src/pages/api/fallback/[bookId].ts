import satori from "satori";
import fs from "fs/promises";
import path from "path";
import type { APIRoute } from "astro";
import Fallback from "@components/Fallback";
import { z } from "zod";
import { getBook } from "@server/db";

const addingtonDemoBoldArrayBuffer = await fs.readFile(
  path.resolve("./src/assets/fonts/addington/AddingtonCF-DemiBold.otf")
);
const addingtonLightArrayBuffer = await fs.readFile(
  path.resolve("./src/assets/fonts/addington/AddingtonCF-Light.otf")
);

//Temporary - the satori package spams the logs. a fix has been merged but waiting for release
//const oldConsoleError = globalThis.console.error;
globalThis.console.error = () => null;

const paramsSchema = z.string();
export const get: APIRoute = async (ctx) => {
  const bookId = paramsSchema.parse(ctx.params["bookId"]);
  const book = await getBook(parseInt(bookId));

  const svg = await satori(Fallback({ book }), {
    width: 425,
    height: 600,
    fonts: [
      {
        name: "Addington",
        data: addingtonDemoBoldArrayBuffer,
        weight: 600,
        style: "normal",
      },
      {
        name: "Addington",
        data: addingtonLightArrayBuffer,
        weight: 400,
        style: "normal",
      },
    ],
  });

  return new Response(svg, {
    headers: { "content-type": `image/svg+xml` },
  });
};
