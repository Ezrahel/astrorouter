CREATE TABLE IF NOT EXISTS "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "api_keys" RENAME TO "auth_tokens";--> statement-breakpoint
ALTER TABLE "auth_tokens" RENAME COLUMN "key" TO "token";--> statement-breakpoint
ALTER TABLE "tunnels" RENAME COLUMN "subdomain" TO "url";--> statement-breakpoint
ALTER TABLE "auth_tokens" DROP CONSTRAINT "api_keys_key_unique";--> statement-breakpoint
ALTER TABLE "tunnels" DROP CONSTRAINT "tunnels_subdomain_unique";--> statement-breakpoint
ALTER TABLE "auth_tokens" DROP CONSTRAINT "api_keys_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "api_keys_userId_idx";--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tunnels" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "tunnels" ADD COLUMN "last_seen_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tunnels" ADD CONSTRAINT "tunnels_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_tokens_organizationId_idx" ON "auth_tokens" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "auth_tokens_userId_idx" ON "auth_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tunnels_organizationId_idx" ON "tunnels" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tunnels_lastSeenAt_idx" ON "tunnels" USING btree ("last_seen_at");--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER TABLE "tunnels" ADD CONSTRAINT "tunnels_url_unique" UNIQUE("url");