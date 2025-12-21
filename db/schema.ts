import {
  mysqlTable,
  int,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

export const queues = mysqlTable("queues", {
  id: int("id").primaryKey().autoincrement(),
  number: varchar("number", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
