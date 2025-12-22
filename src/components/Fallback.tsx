/** @jsxImportSource react */
import type { Book } from "@server/db";

type FallbackProps = {
  book: Book;
};

/**
 * Used to generate dynamic book covers when they do not exist
 * Makes use of the satori package. limited css is supported
 * Find more here ==> https://github.com/vercel/satori#css
 */
const Fallback = ({ book }: FallbackProps) => (
  <div
    style={{
      backgroundColor: "black",
      color: "white",
      width: "425px",
      height: "600px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
      paddingTop: 50,
      paddingBottom: 50,
    }}
  >
    <span
      style={{
        fontSize: 40,
        textAlign: "center",
        fontFamily: "Addington",
        color: "#ababab",
        whiteSpace: "nowrap",
      }}
    >
      {book.username}
    </span>
    <span
      style={{
        fontSize: 60,
        textAlign: "center",
        fontFamily: "Addington",
        fontWeight: 600,
      }}
    >
      {book.title}
    </span>
  </div>
);
export default Fallback;
