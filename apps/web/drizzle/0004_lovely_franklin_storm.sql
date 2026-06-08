CREATE TABLE "subscription_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"month" text NOT NULL,
	"tunnels_used" integer DEFAULT 0 NOT NULL,
	"domains_used" integer DEFAULT 0 NOT NULL,
	"subdomains_used" integer DEFAULT 0 NOT NULL,
	"members_count" integer DEFAULT 0 NOT NULL,
	"requests_count" integer DEFAULT 0 NOT NULL,
	"bandwidth_bytes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"polar_customer_id" text,
	"polar_subscription_id" text,
	"polar_product_id" text,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"trial_ends_at" timestamp,
	"extra_members" integer DEFAULT 0 NOT NULL,
	"extra_domains" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_usage_organizationId_idx" ON "subscription_usage" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscription_usage_month_idx" ON "subscription_usage" USING btree ("month");--> statement-breakpoint
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscriptions_polarCustomerId_idx" ON "subscriptions" USING btree ("polar_customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_polarSubscriptionId_idx" ON "subscriptions" USING btree ("polar_subscription_id");