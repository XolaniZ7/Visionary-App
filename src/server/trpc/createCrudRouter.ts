import { k } from "@server/db"
import { sql } from "kysely"
import { z } from "zod"
import { adminProcedure, t } from "./trpc"

type VisionaryWritingsDatabaseTable = Parameters<typeof k.selectFrom>["0"]
const createCrudRouter = <T extends VisionaryWritingsDatabaseTable>(tableName: T) => {
    return t.router({
        getAll: adminProcedure.input(z.object({
            page: z.number().optional(),
            pageSize: z.number().optional()
        })).query(async ({ input }) => {
            const page = input.page || 1;
            const pageSize = input.pageSize || 10;
            const offset = (page - 1) * pageSize;

            const totalItems = await k.selectFrom(tableName).select(sql<number>`COUNT(*)`.as("count")).executeTakeFirst()
            const totalPages = Math.ceil((totalItems?.count ?? 0) / pageSize);
            const items = await k.selectFrom(tableName).selectAll().offset(offset).limit(10).execute()

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
}

export default createCrudRouter;