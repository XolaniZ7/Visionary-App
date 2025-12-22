import TrpcWrapper from "@app/components/TrpcWrapper";
import { trpc } from "@client/utils";

type SaveBookProps = {
  bookId: number;
  initial: "saved" | "notSaved";
};

const SaveBook = ({ bookId, initial }: SaveBookProps) => {
  return (
    <TrpcWrapper>
      <SaveBookButton initial={initial} bookId={bookId} />
    </TrpcWrapper>
  );
};

const SaveBookButton = ({ bookId, initial }: SaveBookProps) => {
  const savedBook = trpc.getSavedBook.useQuery({ bookId });
  const saveBookMutation = trpc.saveBook.useMutation();
  if (savedBook.isLoading) {
    return (
      <div className="tooltip" data-tip="Remove Book">
        <button className={`btn btn-secondary gap-2`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={initial === "saved" ? "white" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    );
  }

  if (savedBook.data === "unauthorized" || savedBook.data === undefined) {
    return (
      <div className="tooltip" data-tip="Log in to Save Book">
        <a href="/login" className="btn btn-secondary gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </a>
      </div>
    );
  }

  if (savedBook.data === "notSaved") {
    return (
      <div className="tooltip" data-tip="Save Book">
        <button
          onClick={() => saveBookMutation.mutate({ bookId, action: "save" })}
          className={`btn btn-secondary gap-2 ${saveBookMutation.isLoading ? "loading" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="tooltip" data-tip="Remove Book">
      <button
        onClick={() => saveBookMutation.mutate({ bookId, action: "remove" })}
        className={`btn btn-secondary gap-2 ${saveBookMutation.isLoading ? "loading" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="white"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default SaveBook;
