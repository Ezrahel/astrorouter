CREATE TABLE "cli_login_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" text,
	"user_token" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cli_login_sessions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cli_org_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "cli_org_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cli_user_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "cli_user_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "cli_login_sessions" ADD CONSTRAINT "cli_login_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cli_org_tokens" ADD CONSTRAINT "cli_org_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cli_org_tokens" ADD CONSTRAINT "cli_org_tokens_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cli_user_tokens" ADD CONSTRAINT "cli_user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cli_login_sessions_code_idx" ON "cli_login_sessions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "cli_login_sessions_status_idx" ON "cli_login_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cli_org_tokens_token_idx" ON "cli_org_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "cli_org_tokens_user_id_idx" ON "cli_org_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cli_org_tokens_organization_id_idx" ON "cli_org_tokens" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cli_user_tokens_token_idx" ON "cli_user_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "cli_user_tokens_user_id_idx" ON "cli_user_tokens" USING btree ("user_id");