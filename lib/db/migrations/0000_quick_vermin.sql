CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug_en" varchar(256) NOT NULL,
	"slug_ne" varchar(256) NOT NULL,
	"title_en" text NOT NULL,
	"title_ne" text NOT NULL,
	"excerpt_en" text NOT NULL,
	"excerpt_ne" text NOT NULL,
	"body_en" text NOT NULL,
	"body_ne" text NOT NULL,
	"meta_description_en" text NOT NULL,
	"meta_description_ne" text NOT NULL,
	"category_id" integer,
	"source_id" integer,
	"source_url" text NOT NULL,
	"source_headline" text NOT NULL,
	"title_embedding" jsonb,
	"content_hash" varchar(64) NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"image_credit" text,
	"status" varchar(16) DEFAULT 'published',
	"view_count" integer DEFAULT 0,
	"published_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "articles_slug_en_unique" UNIQUE("slug_en"),
	CONSTRAINT "articles_slug_ne_unique" UNIQUE("slug_ne")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name_en" varchar(128) NOT NULL,
	"name_ne" varchar(128) NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cron_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidates_found" integer DEFAULT 0,
	"deduped" integer DEFAULT 0,
	"published" integer DEFAULT 0,
	"run_at" timestamp DEFAULT now(),
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"base_url" text NOT NULL,
	"feed_url" text,
	"type" varchar(16) NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;