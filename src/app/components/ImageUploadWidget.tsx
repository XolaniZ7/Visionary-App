import { vanillaTrpc } from "@client/utils";
import type { FilePondFile } from "filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { z } from "zod";

import type { RouterInput } from "@server/trpc/router";

registerPlugin(FilePondPluginImagePreview);

type ImageUploadWidgetProps = {
  pathPrefix: RouterInput["author"]["getUploadUrl"]["pathPrefix"];
  onSuccess: (id: string) => void;
};
const ImageUploadWidget = ({ pathPrefix, onSuccess }: ImageUploadWidgetProps) => {
  const [files, setFiles] = useState<FilePondFile[]>([]);
  return (
    <div className="App">
      <FilePond
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        files={files}
        onupdatefiles={setFiles}
        maxFiles={3}
        server={{
          process: async (fieldName, file, metadata, load, error, progress, abort) => {
            const uploadLink = await vanillaTrpc.author.getUploadUrl.mutate({ pathPrefix });

            const formData = new FormData();
            formData.append("file", file, uploadLink.filename);

            const request = new XMLHttpRequest();
            request.open("POST", uploadLink.result.uploadURL);

            request.upload.onprogress = (e) => {
              progress(e.lengthComputable, e.loaded, e.total);
            };

            const resultSchema = z.object({
              result: z.object({
                id: z.string(),
                filename: z.string(),
                uploaded: z.string(),
                requireSignedURLs: z.boolean(),
                variants: z.array(z.string()),
              }),
              success: z.boolean(),
              errors: z.array(z.unknown()),
              messages: z.array(z.unknown()),
            });

            // Should call the load method when done and pass the returned server file id
            // this server file id is then used later on when reverting or restoring a file
            // so your server knows which file to return without exposing that info to the client
            request.onload = function () {
              if (request.status >= 200 && request.status < 300) {
                // the load method accepts either a string (id) or an object
                load(request.responseText);
                const data = resultSchema.parse(JSON.parse(request.responseText));
                console.log(data.result.id);
                onSuccess(uploadLink.filename);
              } else {
                // Can call the error method if something is wrong, should exit after
                error("oh no");
              }
            };

            request.send(formData);

            // Should expose an abort method so the request can be cancelled
            return {
              abort: () => {
                // This function is entered if the user has tapped the cancel button
                request.abort();
                // Let FilePond know the request has been cancelled
                abort();
              },
            };
          },
        }}
        name="files" /* sets the file input name, it's filepond by default */
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />
    </div>
  );
};

export default ImageUploadWidget;
