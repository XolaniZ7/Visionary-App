import { PrismaClient } from "@prisma/client";
import { Kysely, MysqlDialect } from "kysely";
import { sql } from "kysely";
import type { DB } from "kysely-codegen";
import { PlanetScaleDialect } from "kysely-planetscale";
import mysql from "mysql2";
import type { AsyncFunctionType, Singular } from "src/shared/types";

import "./security";

/**
 * Prisma and Kysley that can be imported into your 'backend' sections and used
 *
 * p - Prisma Client - Better for simple ORM type queries
 * k - Kysley Client - Better for complex raw-like queries
 */
export const p = new PrismaClient();

const planetScaleDialect = new PlanetScaleDialect({
  url: process.env.DATABASE_URL,
});
const mysqlDialect = new MysqlDialect({
  pool: mysql.createPool({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    uri: process.env.DATABASE_URL,
  }),
});

export const k = new Kysely<DB>({
  dialect: process.env.FEATURE_PLANETSCALE === "true" ? planetScaleDialect : mysqlDialect,
  log(event) {
    if (event.level === "query") {
      console.log(event.query.sql);
      console.log(event.query.parameters);
    }
  },
});

/**
 * Pre-written queries where types can be exported as well
 * The types can be used as props for components
 */

export const getBook = async (bookId: number) =>
  await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .select(["book.title as title", "users.name as username"])
    .where("book.id", "=", bookId)
    .executeTakeFirstOrThrow();

export type Book = AsyncFunctionType<typeof getBook>;

export const getAllBooks = async (offset: number, pageSize: number) => {
  const books = await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    .where("book.complete", "=", "1")
    .where("book.status", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .select([
      "book.id as id",
      "book.title as title",
      "book.description as description",
      "book.slug as slug",
      "book.book_cover as cover",
      "book.user_id as userId",
      "users.name as userName",
      k.fn.count<number>("Chapter.id").as("totalChapters"),
    ])
    .having(k.fn.count("Chapter.id"), ">", 20)
    .orderBy("book.updated_at", "desc")
    .groupBy("book.id")
    .offset(offset)
    .limit(pageSize)
    .execute();

  const count = await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    .where("book.complete", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .select(["book.id as id", k.fn.count<number>("Chapter.id").as("totalChapters")])
    .having(k.fn.count("Chapter.id"), ">", 20)
    .groupBy("book.id")
    .execute();

  return { books, count: count.length };
};

export type AllBooks = AsyncFunctionType<typeof getAllBooks>;
export type AllBook = Singular<AllBooks>;

export const getSavedBooks = async (offset: number, pageSize: number, userId: number) => {
  const books = await p.saved_book.findMany({
    where: {
      usersId: userId,
    },
    include: {
      book: {
        include: {
          user: true,
        },
      },
    },
    skip: offset,
    take: pageSize,
    orderBy: { created_at: "desc" },
  });

  const count = await p.saved_book.count({
    where: {
      usersId: userId,
    },
  });

  return { books, count };
};

export const getFeaturedBooks = async () =>
  await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    .where("book.complete", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .select([
      "book.id as id",
      "book.title as title",
      "book.slug as slug",
      "book.book_cover as cover",
      "book.user_id as userId",
      "users.name as userName",
      k.fn.count<number>("Chapter.id").as("totalChapters"),
    ])
    .having(k.fn.count("Chapter.id"), ">", 20)
    .orderBy("book.updated_at", "desc")
    .groupBy("book.id")
    .limit(15)
    .execute();

export type FeaturedBooks = AsyncFunctionType<typeof getFeaturedBooks>;
export type FeaturedBook = Singular<FeaturedBooks>;

export const getMostPopularBooks = async () =>
  await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    .where("book.complete", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .select([
      "book.id as id",
      "book.title as title",
      "book.slug as slug",
      "book.book_cover as cover",
      "book.user_id as userId",
      "users.name as userName",
      k.fn.count<number>("Chapter.id").as("totalChapters"),
    ])
    .having(k.fn.count("Chapter.id"), ">", 20)
    .orderBy("book.views", "desc")
    .groupBy("book.id")
    .limit(16)
    .execute();

export type MostPopularBooks = AsyncFunctionType<typeof getMostPopularBooks>;
export type MostPopularBook = Singular<FeaturedBooks>;

export const getPremiumBooks = async (getAll = false) =>
  await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    .where("book.status", "=", "1")
    .where("book.complete", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .where("book.exclusiveStatus", "=", "Exclusive")
    .select([
      "book.id as id",
      "book.title as title",
      "book.description as description",
      "book.slug as slug",
      "book.book_cover as cover",
      "book.user_id as userId",
      "users.name as userName",
      k.fn.count<number>("Chapter.id").as("totalChapters"),
    ])
    .orderBy("book.created_at", "desc")
    .groupBy("book.id")
    .limit(getAll ? 1000 : 16)
    .execute();

export type PremiumBooks = AsyncFunctionType<typeof getPremiumBooks>;
export type PremiumBook = Singular<FeaturedBooks>;

export const getMostPopularBooksByGenre = async (genre: string) =>
  await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    .where("book.complete", "=", "1")
    .where("book.status", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .where("genre", "=", genre)
    .select([
      "book.id as id",
      "book.title as title",
      "book.slug as slug",
      "book.book_cover as cover",
      "book.user_id as userId",
      "users.name as userName",
      k.fn.count<number>("Chapter.id").as("totalChapters"),
    ])
    .having(k.fn.count("Chapter.id"), ">", 20)
    .orderBy("book.views", "desc")
    .groupBy("book.id")
    .limit(16)
    .execute();

export const getMonthlyEarnings = async (userId: number) =>
  await k
    .selectFrom("transaction")
    .select([
      sql<string>`SUM(amount)`.as("amount"),
      sql<string>`CONCAT_WS('-',YEAR(date), MONTH(date))`.as("monthyear"),
    ])
    .where("user_id", "=", userId)
    .where("on_views", "!=", 0)
    .where("cron", "=", 1)
    .groupBy("monthyear")
    .orderBy("monthyear", "desc")
    .limit(5)
    .execute();

export type MonthlyEarnings = AsyncFunctionType<typeof getMonthlyEarnings>;
export type MonthlyEarning = Singular<MonthlyEarnings>;

export const getPaymentDetails = async (userId: number) =>
  await k
    .selectFrom("transaction")
    .innerJoin("users", "users.id", "admin_id")
    .selectAll("transaction")
    .select(["users.name as adminName"])
    .where("transaction.user_id", "=", userId)
    .where("transaction.on_views", "=", 0)
    .orderBy("transaction.id", "desc")
    .limit(5)
    .execute();

export type PaymentDetails = AsyncFunctionType<typeof getPaymentDetails>;
export type PaymentDetail = Singular<PaymentDetails>;

export const getBookCountByUser = async (userId: number) =>
  await k
    .selectFrom("books_view_count")
    .innerJoin("book", "book.id", "books_view_count.book_id")
    .select(k.fn.count<number>("books_view_count.id").as("count"))
    .where("book.user_id", "=", userId)
    .executeTakeFirstOrThrow();

export const getLatestApprovedUsers = async () =>
  await k
    .selectFrom("users")
    .innerJoin("profiles", "profiles.user_id", "users.id")
    .selectAll("users")
    .select("profiles.avatar")
    .where("admin", "=", 0)
    .where("active", "=", 1)
    .where("reader", "=", 0)
    .orderBy("approved_at", "desc")
    .limit(15)
    .execute();

export const getAllApprovedAuthors = async () =>
  await k
    .selectFrom("users")
    .innerJoin("profiles", "profiles.user_id", "users.id")
    .selectAll("users")
    .select("profiles.avatar")
    .where("admin", "=", 0)
    .where("active", "=", 1)
    .where("reader", "=", 0)
    .orderBy("name", "asc")
    .execute();

export const findAllActiveBooks = async () =>
  await k
    .selectFrom("book")
    .innerJoin("users", "users.id", "user_id")
    .innerJoin("Chapter", "Chapter.book_id", "book.id")
    //.where("book.complete", "=", "1")
    .where("users.verified", "=", 1)
    .where("users.active", "=", 1)
    .where("book.status", "=", "1")
    .select([
      "book.id as id",
      "book.title as title",
      "book.slug as slug",
      "book.book_cover as cover",
      "book.user_id as userId",
      "users.name as userName",
      "book.description as description",
      k.fn.count<number>("Chapter.id").as("totalChapters"),
    ])
    .groupBy("book.id")
    .execute();

/**
 *   

   public function hasOngoingActiveSubscription()
   {
      $amount = DB::table('payments_subscription')
         ->where('user_id', '=', $this->id)
         ->where('run_date', '>', \DB::raw('NOW()'))
         ->where('status_id', '=', 1)
         ->count();

      $has_active_subscription = $amount > 0;

      return $has_active_subscription;
   }
   public function canOrderNewSubscription()
   {
      return !$this->hasOngoingActiveSubscription();
   }

    public function hasActiveSubscription()
   {
      $amount = DB::table('payments_subscription')
         ->where('user_id', '=', $this->id)
         ->where('run_date', '>', \DB::raw('NOW()'))
         ->count();

      $need_resync = DB::table('payments_subscription')
         ->where('status_id', '=', 7)
         ->count();

      $has_active_subscription = $amount > 0 || $need_resync > 0;

      return $has_active_subscription;
   }
 */

export const hasValidSubscription = async (userId: number) => {
  console.log("Checking has valid subscription");
  const totalValidSubscriptions = await k
    .selectFrom("payments_subscription")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("user_id", "=", userId)
    .where("run_date", ">", sql`NOW()`)
    .executeTakeFirst();

  const needsResync = await k
    .selectFrom("payments_subscription")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("user_id", "=", userId)
    .where("status_id", "=", 7)
    .executeTakeFirst();

  return (totalValidSubscriptions?.count ?? 0) > 0 || (needsResync?.count ?? 0) > 0;
};

export const hasActiveSubscription = async (userId: number) => {
  console.log("Checking has active subscription");
  const totalActiveSubscriptions = await k
    .selectFrom("payments_subscription")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("user_id", "=", userId)
    .where("run_date", ">", sql`NOW()`)
    .where("status_id", "=", 1)
    .executeTakeFirst();

  return (totalActiveSubscriptions?.count ?? 0) > 0;
};

export const getAuthor = async (authorId: number) =>
  await k
    .selectFrom("profiles")
    .innerJoin("users", "users.id", "user_id")
    .selectAll("profiles")
    .selectAll("users")
    .where("user_id", "=", authorId)
    .executeTakeFirstOrThrow();

export type AuthorProfile = AsyncFunctionType<typeof getAuthor>;

export const getChapterComments = async (chapterId: number) => {
  return await k
    .selectFrom("comments")
    .innerJoin("users", "comments.user_id", "users.id")
    .innerJoin("profiles", "profiles.user_id", "users.id")
    .selectAll("comments")
    .select(["name", "avatar"])
    .where("chapter_id", "=", chapterId)
    .where("approve", "=", 1)
    .where("status", "=", 1)
    .where("reply_to", "=", 0)
    .orderBy("comments.id", "desc")
    .execute();
};

export type ChapterComment = Singular<AsyncFunctionType<typeof getChapterComments>>;

export const getCommentReply = async (commentId: number) => {
  return await k
    .selectFrom("comments")
    .innerJoin("users", "comments.user_id", "users.id")
    .innerJoin("profiles", "profiles.user_id", "users.id")
    .selectAll("comments")
    .select(["name", "avatar"])
    .where("approve", "=", 1)
    .where("status", "=", 1)
    .where("reply_to", "=", commentId)
    .executeTakeFirst();
};
