import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 128 }).notNull(),
  nameNe: varchar("name_ne", { length: 128 }).notNull(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  baseUrl: text("base_url").notNull(),
  feedUrl: text("feed_url"),
  type: varchar("type", { length: 16 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slugEn: varchar("slug_en", { length: 256 }).notNull().unique(),
  slugNe: varchar("slug_ne", { length: 256 }).notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleNe: text("title_ne").notNull(),
  excerptEn: text("excerpt_en").notNull(),
  excerptNe: text("excerpt_ne").notNull(),
  bodyEn: text("body_en").notNull(),
  bodyNe: text("body_ne").notNull(),
  metaDescriptionEn: text("meta_description_en").notNull(),
  metaDescriptionNe: text("meta_description_ne").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  sourceId: integer("source_id").references(() => sources.id),
  sourceUrl: text("source_url").notNull(),
  sourceHeadline: text("source_headline").notNull(),
  titleEmbedding: jsonb("title_embedding"),
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  imageCredit: text("image_credit"),
  status: varchar("status", { length: 16 }).default("published"),
  viewCount: integer("view_count").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cronRuns = pgTable("cron_runs", {
  id: serial("id").primaryKey(),
  candidatesFound: integer("candidates_found").default(0),
  deduped: integer("deduped").default(0),
  published: integer("published").default(0),
  runAt: timestamp("run_at").defaultNow(),
  summary: text("summary"),
});
