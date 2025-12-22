import { trpc } from "@client/utils";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import React, { useState } from "react";
import TrpcWrapper from "src/app/components/TrpcWrapper";
import { z } from "zod";

const BookSearchPage = () => {
  return (
    <TrpcWrapper>
      <BookSearch />
    </TrpcWrapper>
  );
};

const BookSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const results = trpc.search.useQuery({ searchTerm: searchTerm });

  const schema = z.object({ searchTerm: z.string() });
  const { form, errors } = useForm<z.infer<typeof schema>>({
    onSubmit: (values) => {
      setSearchTerm(values.searchTerm);
    },
    extend: validator({ schema }),
    initialValues: {
      searchTerm: "",
    },
  });

  return (
    <div className="flex justify-center p-5 min-h-[60vh]">
      <div className="container max-w-4xl">
        <form ref={form} className="flex items-center">
          <label htmlFor="simple-search" className="sr-only">
            Search
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              name="searchTerm"
              type="text"
              placeholder="Search for Books, Authors or Genres"
              className="input bg-base-300 border-base-content rounded-full w-full pl-10"
            />
          </div>
        </form>
        {results.isLoading ? (
          <div className="flex justify-center p-3">
            <div className="border-t-transparent border-solid animate-spin rounded-full border-blue-400 border-8 h-20 w-20"></div>
          </div>
        ) : results.data ? (
          <section>
            {results.data.map((result) => (
              <div key={result.item.id}>{result.item.title}</div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default BookSearchPage;
