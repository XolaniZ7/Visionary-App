import { authedProcedure, adminProcedure, t } from "./trpc";
import { getBookCountByUser, getMonthlyEarnings, getPaymentDetails, hasActiveSubscription, hasValidSubscription, k, p } from "@server/db";
import { inferRouterInputs, inferRouterOutputs, TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateFilename, slugify } from "src/shared/utils";
import { authorFuse, booksFuse } from "@server/search";
import { sql } from "kysely";
import { sendWelcomeEmail } from "@server/email";
import { getSubsciptionPlans } from "@server/subscriptionLogic";
import { cancelSubscription, resyncSubscription } from "@server/payfast";
import { approveText } from "@server/astroHelpers";


const billingRouter = t.router({
  cancelSubscription: authedProcedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
    await cancelSubscription(input.token)
    await resyncSubscription(input.token)
  }),
  getValidSubscriptions: t.procedure.query(async ({ ctx }) => {
    const userId = ctx?.session?.user?.id
    if (!userId) return []

    return await p.payments_subscription.findMany({
      where: {
        OR: [{ user_id: userId, run_date: { gt: new Date() } }, { user_id: userId, status_id: 7 }]
      }, include: { payments_subscription_frequency: true }
    })
  }),
  getSubscriptionInfo: t.procedure.query(async () => {
    return await getSubsciptionPlans()
  }),
  getSubscriptionStatus: t.procedure.query(async ({ ctx }) => {

    const userId = ctx?.session?.user?.id
    if (!userId) return { hasValidSubscriptionResult: false, hasActiveSubscriptionResult: false, canOrderNewSubscription: true }

    const hasValidSubscriptionResult = await hasValidSubscription(userId)
    const hasActiveSubscriptionResult = await hasActiveSubscription(userId)
    const canOrderNewSubscription = !hasActiveSubscriptionResult
    return { hasValidSubscriptionResult, hasActiveSubscriptionResult, canOrderNewSubscription }
  })
})

const adminRouter = t.router({
  exclusives: t.router({
    getExclusiveRequests: adminProcedure.query(async () => {
      return await p.book.findMany({
        where: {
          exclusiveStatus: "Review"
        },
        include: {
          user: true
        }
      })
    }),
    getApprovedPremiumBooks: adminProcedure.query(async () => {
      return await p.book.findMany({
        where: {
          exclusiveStatus: "Exclusive"
        },
        include: {
          user: true
        }
      })
    }),
    getRejectedPremiumBooks: adminProcedure.query(async () => {
      return await p.book.findMany({
        where: {
          exclusiveStatus: "NotExclusive",
          exclusiveMessage: {
            not: null
          }
        },
        include: {
          user: true
        }
      })
    })
  }),
  paymentRequest: t.router({
    get: adminProcedure.input(z.object({ paymentRequestId: z.number() })).query(async ({ input }) => {
      return await p.payment_request.findFirst({
        where: {
          id: input.paymentRequestId,
          status: "PENDING"
        },
        include: {
          user: true
        }
      })
    }),
    getAll: authedProcedure.query(async () => {
      return await p.payment_request.findMany({
        where: {
          status: "PENDING"
        },
        include: {
          user: true
        }
      })
    })
  }),
  pay: t.router({
    payAuthor: adminProcedure.input(z.object({ amount: z.number(), userId: z.number(), paymentRequestId: z.number().optional() })).mutation(async ({ input, ctx }) => {
      const adminAmount = ctx.session.user.amount.toNumber()
      const author = await p.users.findUniqueOrThrow({ where: { id: input.userId } })
      if (adminAmount < author.amount.toNumber()) throw new TRPCError({ message: "You do not have enough money to pay!", code: "UNAUTHORIZED" })

      await p.transaction.create({
        data: {
          admin_id: ctx.session.user.id,
          user_id: author.id,
          amount: input.amount,
          type: "debit"
        }
      })

      await p.users.update({ where: { id: input.userId }, data: { amount: { decrement: input.amount } } })
      await p.users.updateMany({ where: { admin: true }, data: { amount: { decrement: input.amount } } })

      if (input.paymentRequestId) {
        await p.payment_request.update({ where: { id: input.paymentRequestId }, data: { status: "COMPLETE" } })
      }

    }),
    getAuthorWallet: adminProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      const userInfo = await k
        .selectFrom("users")
        .innerJoin("profiles", "profiles.user_id", "users.id")
        .selectAll("users")
        .select("profiles.avatar")
        .where("user_id", "=", input.userId)
        .executeTakeFirstOrThrow()

      const bankDetails = await p.bank_details.findFirst({ where: { user_id: input.userId } })

      const bankDetail = bankDetails ? {
        id: bankDetails.id,
        name: Buffer.from(bankDetails.name.substring(5) ?? "", 'base64').toString('utf8'),
        surname: Buffer.from(bankDetails.surname.substring(5) ?? "", 'base64').toString('utf8'),
        bankName: Buffer.from(bankDetails.bank_name.substring(5) ?? "", 'base64').toString('utf8'),
        accountNumber: Buffer.from(bankDetails.account_number.substring(5) ?? "", 'base64').toString('utf8'),
        branch: Buffer.from(bankDetails.branch.substring(5) ?? "", 'base64').toString('utf8'),

      } : null

      return { userInfo, bankDetail }
    })
  }),
  restrictions: t.router({
    links: t.router({
      delete: adminProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input }) => {
        return await p.rlinks.delete({
          where: { id: input.id },
        })
      }),
      create: adminProcedure.input(z.object({ link: z.string().url() })).mutation(async ({ input }) => {
        return await p.rlinks.create({
          data: { link: input.link, status: 0 }
        })
      }),
      getAll: adminProcedure.query(async () => {
        return await p.rlinks.findMany({ orderBy: { id: "desc" } })
      }),
      setStatus: adminProcedure.input(z.object({
        id: z.number(),
        status: z.boolean(),
      })).mutation(async ({ input }) => {
        //await sendEmail()
        return await p.rlinks.update({
          where: { id: input.id },
          data: {
            status: input.status ? 1 : 0,
          }
        })
      }),
    }),
    words: t.router({
      delete: adminProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input }) => {
        return await p.rkeywords.delete({
          where: { id: input.id },
        })
      }),
      create: adminProcedure.input(z.object({ keyword: z.string().min(1) })).mutation(async ({ input }) => {
        return await p.rkeywords.create({
          data: { keyword: input.keyword, status: 0 }
        })
      }),
      getAll: adminProcedure.query(async () => {
        return await p.rkeywords.findMany({ orderBy: { id: "desc" } })
      }),
      setStatus: adminProcedure.input(z.object({
        id: z.number(),
        status: z.boolean(),
      })).mutation(async ({ input }) => {
        return await p.rkeywords.update({
          where: { id: input.id },
          data: {
            status: input.status ? 1 : 0,
          }
        })
      }),
    }),
  }),
  ads: t.router({
    delete: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      return await p.ads.delete({
        where: { id: input.id },
      })
    }),
    setStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.boolean(),
    })).mutation(async ({ input }) => {
      return await p.ads.update({
        where: { id: input.id },
        data: {
          status: input.status,
        }
      })
    }),
    create: adminProcedure.input(z.object({
      adPlacemant: z.string().min(1),
      pagePlacement: z.string().min(1),
      adCode: z.string().min(1),
    })).mutation(async ({ input }) => {
      return await p.ads.create({
        data: {
          page: input.pagePlacement,
          type: input.adPlacemant,
          code: input.adCode
        }
      })
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      adPlacemant: z.string().min(1),
      pagePlacement: z.string().min(1),
      adCode: z.string().min(1),
    })).mutation(async ({ input }) => {
      return await p.ads.update({
        where: { id: input.id },
        data: {
          page: input.pagePlacement,
          type: input.adPlacemant,
          code: input.adCode
        }
      })
    }),
    get: adminProcedure.input(z.object({ adId: z.number() })).query(async ({ input }) => {
      return await p.ads.findUnique({ where: { id: input.adId } })
    }),
    getAll: adminProcedure.query(async () => {
      return await p.ads.findMany()
    })
  }),
  payfast: t.router({
    setProductionEnabled: adminProcedure.input(z.boolean()).mutation(async ({ input }) => {
      return await p.payments_global_settings.updateMany({
        data: {
          sandbox_enabled: input
        }
      })
    }),
    isProductionEnabled: adminProcedure.query(async () => {
      return await p.payments_global_settings.findFirst()
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      merchant_id: z.number().min(1),
      merchant_key: z.string().min(1),
      passphrase: z.string().min(1),
    })).mutation(async ({ input }) => {
      return await p.payments_payfast_integration.update({
        where: {
          id: input.id
        }, data: input
      })
    }),
    get: adminProcedure.query(async () => {
      const payfastDetails = await p.payments_payfast_integration.findMany()
      return payfastDetails
    })
  }),
  users: t.router({
    setActive: adminProcedure.input(z.object({ userId: z.number(), active: z.boolean() })).mutation(async ({ input }) => {
      const user = await p.users.update({ where: { id: input.userId }, data: { active: input.active } })
      if (input.active) {
        await p.users.update({ where: { id: input.userId }, data: { approved_at: new Date() } })
        await sendWelcomeEmail(user.name, user.email)
      }
      return user
    }),
    getAll: adminProcedure.input(z.object({
      searchTerm: z.string().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      active: z.boolean()
    })).query(async ({ input }) => {
      const page = input.page || 1;
      const pageSize = input.pageSize || 10;
      const offset = (page - 1) * pageSize;

      let totalItemsQuery = k.selectFrom("users").select(sql<number>`COUNT(*)`.as("count")).where("active", "=", input.active ? 1 : 0) //.executeTakeFirst()

      if (input.searchTerm) {
        totalItemsQuery = totalItemsQuery.where("name", "like", `%${input.searchTerm}%`).orWhere("email", "like", `%${input.searchTerm}%`)
      }

      const totalItems = await totalItemsQuery.executeTakeFirst()

      const totalPages = Math.ceil((totalItems?.count ?? 0) / pageSize);
      let itemsQuery = k.selectFrom("users")
        .selectAll("users")
        .select(sql<number>`
        (
          SELECT COUNT(*) 
          FROM book 
          WHERE book.user_id = users.id 
          AND book.status=1
          LIMIT 1
        )`
          .as("totalBooks"))
        .where("active", "=", input.active ? 1 : 0)
        .offset(offset)
        .limit(pageSize)

      if (input.searchTerm) {
        itemsQuery = itemsQuery.where("name", "like", `%${input.searchTerm}%`).orWhere("email", "like", `%${input.searchTerm}%`)
      }

      const items = await itemsQuery.execute()

      return {
        items: items,
        pagination: {
          totalPages: totalPages,
          currentPage: page,
          totalItems
        }
      };
    })
  })
})

const authorRouter = t.router({
  getSubscribedViews: authedProcedure.input(z.object({ bookId: z.number() })).query(async ({ input, ctx }) => {

    const subscribedViews = await p.premium_books_view_count.aggregate({
      _count: true,
      where: {
        book_id: input.bookId
      }
    })

    return subscribedViews._count

  }),
  getBookCountByUser: authedProcedure.query(async ({ ctx }) => {
    return await getBookCountByUser(ctx.session.user.id)
  }),
  paymentDetails: t.router({
    getAll: authedProcedure.query(async ({ ctx }) => {
      return await getPaymentDetails(ctx.session.user.id)
    })
  }),
  monthlyEarnings: t.router({
    getAll: authedProcedure.query(async ({ ctx }) => {
      return await getMonthlyEarnings(ctx.session.user.id)
    })
  }),
  tips: t.router({
    getAll: authedProcedure.query(async ({ ctx }) => {
      const tips = await k.selectFrom("payments_donations_view").selectAll()
        .where("author_id", "=", ctx.session.user.id)
        .orderBy("created_at", "desc").execute()

      return tips
    })
  }),
  bankDetails: t.router({
    create: authedProcedure.mutation(async ({ ctx }) => {
      return await p.bank_details.create({
        data: {
          user_id: ctx.session.user.id,
          name: '',
          surname: '',
          bank_name: '',
          account_number: '',
          branch: ''
        }
      })
    }),
    update: authedProcedure.input(z.object({
      id: z.number().optional(),
      name: z.string().min(2),
      surname: z.string().min(2),
      bankName: z.string().min(2),
      accountNumber: z.string().min(2),
      branch: z.string().min(2),
    })).mutation(async ({ input, ctx }) => {
      function makeid(length: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
      }

      const currentBankDetails = await p.bank_details.findUnique({ where: { id: input.id || 0 } })
      if (currentBankDetails && currentBankDetails.user_id !== ctx.session.user.id) {
        throw new TRPCError({ message: "Not Allowed", code: "UNAUTHORIZED" })
      }

      console.log({ currentBankDetails })

      return await p.bank_details.upsert({
        where: {
          id: input.id || 0,
        },
        create: {
          name: `${makeid(5)}${Buffer.from(input.name).toString('base64')}`,
          surname: `${makeid(5)}${Buffer.from(input.surname).toString('base64')}`,
          bank_name: `${makeid(5)}${Buffer.from(input.bankName).toString('base64')}`,
          account_number: `${makeid(5)}${Buffer.from(input.accountNumber).toString('base64')}`,
          branch: `${makeid(5)}${Buffer.from(input.branch).toString('base64')}`,
          user_id: ctx.session.user.id
        }, update: {
          name: `${makeid(5)}${Buffer.from(input.name).toString('base64')}`,
          surname: `${makeid(5)}${Buffer.from(input.surname).toString('base64')}`,
          bank_name: `${makeid(5)}${Buffer.from(input.bankName).toString('base64')}`,
          account_number: `${makeid(5)}${Buffer.from(input.accountNumber).toString('base64')}`,
          branch: `${makeid(5)}${Buffer.from(input.branch).toString('base64')}`
        }
      });
    }),
    get: authedProcedure.query(async ({ ctx }) => {
      const bankDetails = await p.bank_details.findFirst({
        where: {
          user_id: ctx.session.user.id
        }
      })

      return bankDetails ? {
        id: bankDetails.id,
        name: Buffer.from(bankDetails?.name.substring(5) ?? "", 'base64').toString('utf8'),
        surname: Buffer.from(bankDetails?.surname.substring(5) ?? "", 'base64').toString('utf8'),
        bankName: Buffer.from(bankDetails?.bank_name.substring(5) ?? "", 'base64').toString('utf8'),
        accountNumber: Buffer.from(bankDetails?.account_number.substring(5) ?? "", 'base64').toString('utf8'),
        branch: Buffer.from(bankDetails?.branch.substring(5) ?? "", 'base64').toString('utf8'),

      } : null
    })

  }),
  chapters: t.router({
    moveToDraft: authedProcedure.input(z.object({ chapterId: z.number() })).mutation(async ({ input, ctx }) => {
      return await p.chapter.updateMany({
        where: {
          id: input.chapterId,
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
          }
        },
        data: {
          deleted_at: null,
          status: false
        }
      })
    }),
    moveToPublish: authedProcedure.input(z.object({ chapterId: z.number() })).mutation(async ({ input, ctx }) => {
      return await p.chapter.updateMany({
        where: {
          id: input.chapterId,
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
          }
        },
        data: {
          deleted_at: null,
          status: true
        }
      })
    }),
    moveToTrash: authedProcedure.input(z.object({ chapterId: z.number() })).mutation(async ({ input, ctx }) => {
      return await p.chapter.updateMany({
        where: {
          id: input.chapterId,
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
          }
        },
        data: {
          deleted_at: new Date()
        }
      })
    }),
    get: authedProcedure.input(z.object({ chapterId: z.number() })).query(async ({ input, ctx }) => {
      return await p.chapter.findFirst({
        where: {
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
          }, id: input.chapterId
        },
        include: {
          book: {
            include: {
              user: {
                select: {
                  id: true, admin: true
                }
              }
            }
          }
        }
      })
    }),
    create: authedProcedure.input(z.object({
      bookId: z.number(),
      title: z.string(),
      content: z.string(),
    })).mutation(async ({ input, ctx }) => {

      const book = await p.book.findFirst({ where: { id: input.bookId, user_id: ctx.session.user.id } })

      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      const chapter = await p.chapter.create({
        data: {
          book_id: book.id,
          title: input.title,
          chapter_content: input.content,
          slug: slugify(input.title),
          status: false
        }
      })

      return chapter
    }),
    edit: authedProcedure.input(z.object({
      chapterId: z.number(),
      title: z.string(),
      content: z.string(),
    })).mutation(async ({ input, ctx }) => {

      await p.chapter.updateMany({
        where: {
          id: input.chapterId,
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
          }
        },
        data: {
          title: input.title,
          chapter_content: input.content,
        }
      })
    }),
    getAll: authedProcedure.input(z.object({
      bookId: z.number(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
      type: z.enum(["published", "draft"]).optional().default("published")
    })).query(async ({ input, ctx }) => {

      const page = input.page || 1; // set a default page number
      const pageSize = input.pageSize || 10; // set a default page size

      // calculate the offset using page number and page size
      const offset = (page - 1) * pageSize;

      // get the total number of items
      const totalItems = await p.chapter.count({
        where: {
          deleted_at: null,
          status: input.type == "published" ? true : false,
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
            id: input.bookId
          }
        }, orderBy: {
          created_at: "asc"
        }
      });

      // calculate the total number of pages
      const totalPages = Math.ceil(totalItems / pageSize);

      // get the chapters
      const chapters = await p.chapter.findMany({
        where: {
          deleted_at: null,
          status: input.type == "published" ? true : false,
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
            id: input.bookId,
            deleted_at: null
          }
        },
        orderBy: {
          created_at: "asc"
        },
        take: pageSize,
        skip: offset
      });

      // return chapters along with pagination details
      return {
        chapters,
        pagination: {
          totalPages,
          currentPage: page,
          totalItems
        }
      };
    }),
    getTrashedChapters: authedProcedure.input(z.object({
      bookId: z.number(),
      page: z.number().optional(),
      pageSize: z.number().optional()
    })).query(async ({ input, ctx }) => {

      const page = input.page || 1; // set a default page number
      const pageSize = input.pageSize || 10; // set a default page size

      // calculate the offset using page number and page size
      const offset = (page - 1) * pageSize;

      // get the total number of items
      const totalItems = await p.chapter.count({
        where: {
          NOT: {
            deleted_at: null
          },

          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
            id: input.bookId
          }
        }, orderBy: {
          created_at: "asc"
        }
      });

      // calculate the total number of pages
      const totalPages = Math.ceil(totalItems / pageSize);

      // get the chapters
      const chapters = await p.chapter.findMany({
        where: {
          NOT: {
            deleted_at: null
          },
          book: {
            ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
            id: input.bookId,
            deleted_at: null
          }
        },
        orderBy: {
          created_at: "asc"
        },
        take: pageSize,
        skip: offset
      });

      // return chapters along with pagination details
      return {
        chapters,
        pagination: {
          totalPages,
          currentPage: page,
          totalItems
        }
      };
    })
  }),
  getBooks: authedProcedure.input(z.object({ type: z.enum(["book", "draft"]) })).query(async ({ input, ctx }) => {
    const books = await p.book.findMany({
      where: {
        user_id: ctx.session.user.id,
        status: input.type == "book" ? "1" : "0",
        deleted_at: null
      },
      orderBy: {
        book_order: "asc",
        //created_at: "desc" 
      }
    });
    return books;
  }),
  getTrashedBooks: authedProcedure.query(async ({ ctx }) => {
    const books = await p.book.findMany({
      where: {
        user_id: ctx.session.user.id,
        NOT: {
          deleted_at: null
        }
      },
      orderBy: {
        deleted_at: "desc"
      }
    });
    return books;
  }),
  createBook: authedProcedure.input(
    z.object({
      title: z.string().min(2, "Your title is too short"),
      genre: z.enum(["Drama", "Horror", "Romance", "Thriller", "Science", "Fiction", "Poetry", "True Story", "Action", "Fantasy", "Adult"])
    })).mutation(async ({ input, ctx }) => {
      return await p.book.create({
        data: {
          title: input.title,
          user_id: ctx.session.user.id,
          book_order: 0,
          genre: input.genre,
          description: "",
          status: "0",
          slug: slugify(input.title),
          book_cover: undefined,
          complete: ""
        }
      })
    }),
  updateBook: authedProcedure.input(
    z.object({
      id: z.number(),
      title: z.string().min(2, "Your title is too short"),
      description: z.string().optional(),
      genre: z.enum(["Drama", "Horror", "Romance", "Thriller", "Science", "Fiction", "Poetry", "True Story", "Action", "Fantasy", "Adult"])
    })).mutation(async ({ input, ctx }) => {

      const book = await p.book.findFirst({
        where: { id: input.id }
      });

      if (book && ((book.user_id === ctx.session.user.id) || (ctx.session.user.admin == true))) {
        return await p.book.updateMany({
          where: {
            id: input.id
          },
          data: {
            title: input.title,
            genre: input.genre,
            description: input.description,
          }
        })
      }
    }),
  moveToDrafts: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        status: "0"
      }
    })
  }),

  moveToPublished: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        status: "1"
      }
    })
  }),
  markAsComplete: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        complete: "1"
      }
    })
  }),
  markAsNotComplete: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        complete: "0"
      }
    })
  }),
  requestExclusive: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        exclusiveStatus: "Review"
      }
    })
  }),
  confirmExclusive: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        exclusiveStatus: "Exclusive",
        status: "1"
      }
    })
  }),
  rejectExclusive: authedProcedure.input(z.object({ bookId: z.number(), message: z.string() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        exclusiveStatus: "NotExclusive",
        exclusiveMessage: input.message
      }
    })
  }),
  deletePermanently: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.deleteMany({
      where: {
        id: input.bookId,
        user_id: ctx.session.user.id
      },

    })
  }),
  moveToTrash: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        deleted_at: new Date()
      }
    })
  }),
  moveToRestore: authedProcedure.input(z.object({ bookId: z.number() })).mutation(async ({ input, ctx }) => {
    return await p.book.updateMany({
      where: {
        id: input.bookId,
        ...(ctx.session.user.admin ? {} : { user_id: ctx.session.user.id }),
      },
      data: {
        deleted_at: null,
        status: "0" // Move to Drafts instead of published
      }
    })
  }),
  getBook: authedProcedure.input(z.object({ bookId: z.number() })).query(async ({ input, ctx }) => {
    const books = await p.book.findFirst({
      where: { id: input.bookId },
      include: {
        _count: {
          select: {
            Chapter: {
              where: {
                status: true,
                deleted_at: null
              }
            }
          }
        }
      },
    });



    if (books && ((books.user_id === ctx.session.user.id) || (ctx.session.user.admin == true))) {
      return books;
    }

  }),
  updateBookOrdering: authedProcedure.input(z.array(z.object({
    id: z.number(),
    title: z.string(),
    book_order: z.number(),
    slug: z.string(),
    status: z.string(),
    complete: z.string(),
    genre: z.string().nullable(),
    description: z.string().nullable(),
    book_cover: z.string(),
    deleted_at: z.date().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
    user_id: z.number(),
    views: z.number().nullable()
  }))).mutation(async ({ input, ctx }) => {
    await k.transaction().execute(async trx => {
      input.map(async (book, index) => {
        trx.updateTable("book")
          .set({ book_order: index })
          .where("id", "=", book.id)
          .where("book.user_id", "=", ctx.session.user.id)
          .execute()
      })

      return "Success"

    })

  }),
  getUploadUrl: authedProcedure.input(z.object({ pathPrefix: z.enum(["avatars", "uploads"]) })).mutation(async ({ input }) => {
    const apiKey = process.env.CLOUDFLARE_IMAGES_KEY

    const schema = z.object({
      result: z.object({ id: z.string(), uploadURL: z.string() }),
      success: z.boolean(),
      errors: z.array(z.unknown()),
      messages: z.array(z.unknown())
    })

    const formData = new FormData();
    const newName = generateFilename();
    formData.append("id", `${input.pathPrefix}/${newName}`);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${apiKey}`);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
    };

    const data = await fetch("https://api.cloudflare.com/client/v4/accounts/98cd033a4d640598c0821207527f2085/images/v2/direct_upload", requestOptions)
      .then(response => response.json())

    console.log(data)
    const result = schema.parse(data)

    return { ...result, filename: newName }
  }),
  updateBookCover: authedProcedure.input(z.object({ bookId: z.number(), coverId: z.string() })).mutation(async ({ input, ctx }) => {

    const book = await p.book.findFirst({
      where: { id: input.bookId }
    });

    if (book && ((book.user_id === ctx.session.user.id) || (ctx.session.user.admin == true))) {
      return await p.book.updateMany({
        where: {
          id: input.bookId
        }, data: {
          book_cover: input.coverId
        }
      })
    }
  })
});

export const appRouter = t.router({
  getSavedBook: t.procedure.input(z.object({ bookId: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.session?.user?.id) return "unauthorized"
    const savedBook = await p.saved_book.findFirst({ where: { usersId: ctx.session.user.id, bookId: input.bookId } })
    return savedBook ? "saved" : "notSaved"
  }),
  saveBook: authedProcedure.input(z.object({ bookId: z.number(), action: z.enum(["save", "remove"]) })).mutation(async ({ input, ctx }) => {
    if (input.action === "remove") {
      await p.saved_book.deleteMany({ where: { usersId: ctx.session.user.id, bookId: input.bookId } })
    }
    if (input.action === "save") {
      await p.saved_book.create({ data: { usersId: ctx.session.user.id, bookId: input.bookId } })
    }
  }),
  searchAuthors: adminProcedure.input(z.object({ searchTerm: z.string() })).query(({ input }) => {
    const results = authorFuse.search(input.searchTerm, { limit: 10 })
    return results
  }),
  search: t.procedure.input(z.object({ searchTerm: z.string() })).query(({ input }) => {
    const bookResults = booksFuse.search(input.searchTerm, { limit: 10 })
    return bookResults
  }),
  hello: t.procedure.query(async () => {
    const us = await p.users.count();
    return { us };
  }),
  getCurrentUser: authedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
  getBooks: t.procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(() => {
      return "Books";
    }),
  author: authorRouter,
  admin: adminRouter,
  billing: billingRouter,
  profile: t.router({
    updateAvatar: authedProcedure.input(z.object({ imageId: z.string() })).mutation(async ({ input, ctx }) => {
      return await p.profiles.updateMany({
        where: {
          user_id: ctx.session.user.id,
        }, data: {
          avatar: input.imageId
        }
      })
    }),
    update: authedProcedure.input(z.object({
      name: z.string().min(2),
      surname: z.string(),
      about: z.string().min(2),
      gender: z.enum(["Male", "Female"]),
      dateOfBirth: z.coerce.date(),
    })).mutation(async ({ input, ctx }) => {
      await p.users.update({
        where: { id: ctx.session.user.id }, data: {
          name: input.name,
          lastname: input.surname,
        }
      })
      await p.profiles.updateMany({
        where: { user_id: ctx.session.user.id }, data: {
          gender: input.gender,
          dob: input.dateOfBirth.toISOString()
            .slice(0, 10),
          about: input.about
        }
      })
    }),
    get: authedProcedure.query(async ({ ctx }) => {
      return await k.selectFrom("profiles")
        .innerJoin("users", "user_id", "users.id")
        .selectAll()
        .where("user_id", "=", ctx.session.user.id)
        .executeTakeFirstOrThrow()
    })
  }),
  comments: t.router({
    setApproval: adminProcedure.input(z.object({
      commentId: z.number(),
      approval: z.number()
    })).mutation(async ({ input }) => {
      return await p.comments.update({ where: { id: input.commentId }, data: { approve: input.approval, status: input.approval } })
    }),
    delete: authedProcedure.input(z.object({
      commentId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      return await p.comments.deleteMany({ where: { user_id: ctx.session.user.id, id: input.commentId } })
    }),
    getReply: authedProcedure.input(z.object({ commentId: z.number() })).query(async ({ input, ctx }) => {
      return await p.comments.findFirst({ where: { reply_to: input.commentId, user_id: ctx.session.user.id, status: 1 } })
    }),
    reply: authedProcedure.input(z.object({
      commentId: z.number(),
      reply: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {

      const commentIsSafe = await approveText(input.reply);
      const comment = await p.comments.findUnique({ where: { id: input.commentId } })
      console.log({ comment })

      if (!comment) throw new TRPCError({ message: "Comment does not exist", code: "NOT_FOUND" })

      await p.comments.create({
        data: {
          user_name: ctx.session.user.name,
          user_email: ctx.session.user.email,
          user_id: ctx.session.user.id,
          chapter_id: comment.chapter_id,
          reply_to: input.commentId,
          comment: input.reply,
          status: commentIsSafe ? 1 : 0,
          approve: commentIsSafe ? 1 : 0,
          updated_at: new Date(),
        },
      });

      const successMessage = commentIsSafe
        ? "Awesome! Your reply has been added successfully!"
        : "Thank you! Your reply has been submitted and is awaiting approval";

      return { successMessage }


    }),
    getBookComments: authedProcedure.input(z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      type: z.enum(["my", "book", "all", "allNeedsApproval"])
    })).query(async ({ input, ctx }) => {

      if ((input.type === "all" || input.type === "allNeedsApproval") && !ctx.session.user.admin) {
        throw new TRPCError({ message: "Only for Admins", code: "UNAUTHORIZED" })
      }

      const page = input.page || 1; // set a default page number
      const pageSize = input.pageSize || 10; // set a default page size
      const offset = (page - 1) * pageSize; // calculate the offset using page number and page size


      let bookCommentsQuery = k.selectFrom("comments")
        .innerJoin("Chapter", "Chapter.id", "comments.chapter_id")
        .innerJoin("book", "book.id", "Chapter.book_id")
        .innerJoin("profiles", "profiles.user_id", "comments.user_id")

      if (input.type === "allNeedsApproval") {
        bookCommentsQuery = k.selectFrom("comments")
          .innerJoin("Chapter", "Chapter.id", "comments.chapter_id")
          .innerJoin("book", "book.id", "Chapter.book_id")
          .innerJoin("profiles", "profiles.user_id", "comments.user_id")
          .where("comments.approve", "=", 0)
      }

      if (input.type === "book") {
        bookCommentsQuery = k.selectFrom("comments")
          .innerJoin("Chapter", "Chapter.id", "comments.chapter_id")
          .innerJoin("book", "book.id", "Chapter.book_id")
          .innerJoin("profiles", "profiles.user_id", "comments.user_id")
          .where("book.user_id", "=", ctx.session.user.id)
          .where("comments.user_id", "!=", ctx.session.user.id)
      }

      if (input.type === "my") {
        bookCommentsQuery = k.selectFrom("comments")
          .innerJoin("profiles", "profiles.user_id", "comments.user_id")
          .innerJoin("Chapter", "Chapter.id", "comments.chapter_id")
          .innerJoin("book", "book.id", "Chapter.book_id")
          .where("comments.user_id", "=", ctx.session.user.id)
      }


      const { totalItems } = await bookCommentsQuery.select(eb => eb.fn.count<number>("comments.id").as("totalItems")).executeTakeFirstOrThrow()
      const totalPages = Math.ceil(totalItems / pageSize);
      const bookComments = await bookCommentsQuery
        .selectAll("comments")
        .select(["book_id", "book_cover", "book.title as title", "profiles.avatar"])
        .select("comments.id as commentKey")
        .select("Chapter.title as chapterTitle")
        .offset(offset)
        .limit(pageSize)
        .orderBy("comments.created_at", "desc")
        .execute()

      return {
        bookComments,
        pagination: {
          totalPages,
          currentPage: page,
          totalItems
        }
      };

    })
  }),
  paymentRequest: t.router({
    getAll: authedProcedure.query(async ({ ctx }) => {
      return await p.payment_request.findMany({
        where: {
          usersId: ctx.session.user.id
        }
      })
    }),
    create: authedProcedure.input(z.object({ amount: z.number().min(0) })).mutation(async ({ input, ctx }) => {
      if (input.amount < 1000) {
        throw new TRPCError({ message: "You cannot withdraw less than R1000. Publishing premium books helps you reach this threshold faster - keep writing and sharing your work!", code: "BAD_REQUEST" })
      }
      if (input.amount > parseFloat(ctx.session.user.amount.toString())) {
        throw new TRPCError({ message: "You have insufficient funds in your wallet!", code: "BAD_REQUEST" })
      }

      const existingPendingPaymentRequests = await p.payment_request.findMany({
        where: {
          usersId: ctx.session.user.id,
          status: "PENDING"
        }
      })

      if (existingPendingPaymentRequests.length > 0) {
        throw new TRPCError({ message: "You already have a pending payment request", code: "BAD_REQUEST" })
      }

      await p.payment_request.create({
        data: {
          usersId: ctx.session.user.id,
          amount: input.amount
        }
      })

    })
  })
});



export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
