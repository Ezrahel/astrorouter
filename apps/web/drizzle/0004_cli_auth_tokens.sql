-- CLI Login Sessions
CREATE TABLE IF NOT EXISTS "cli_login_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" text,
	"user_token" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cli_login_sessions_code_unique" UNIQUE("code")
);

-- CLI User Tokens (long-lived, cross-org)
CREATE TABLE IF NOT EXISTS "cli_user_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "cli_user_tokens_token_unique" UNIQUE("token")
);

-- CLI Org Tokens (org-scoped)
CREATE TABLE IF NOT EXISTS "cli_org_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "cli_org_tokens_token_unique" UNIQUE("token")
);

-- Foreign Keys
ALTER TABLE "cli_login_sessions" ADD CONSTRAINT "cli_login_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cli_user_tokens" ADD CONSTRAINT "cli_user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cli_org_tokens" ADD CONSTRAINT "cli_org_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cli_org_tokens" ADD CONSTRAINT "cli_org_tokens_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;

-- Indexes
CREATE INDEX IF NOT EXISTS "cli_login_sessions_code_idx" ON "cli_login_sessions" ("code");
CREATE INDEX IF NOT EXISTS "cli_login_sessions_status_idx" ON "cli_login_sessions" ("status");
CREATE INDEX IF NOT EXISTS "cli_user_tokens_token_idx" ON "cli_user_tokens" ("token");
CREATE INDEX IF NOT EXISTS "cli_user_tokens_user_id_idx" ON "cli_user_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "cli_org_tokens_token_idx" ON "cli_org_tokens" ("token");
CREATE INDEX IF NOT EXISTS "cli_org_tokens_user_id_idx" ON "cli_org_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "cli_org_tokens_organization_id_idx" ON "cli_org_tokens" ("organization_id");
