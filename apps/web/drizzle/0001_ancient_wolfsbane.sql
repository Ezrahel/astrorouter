DELETE FROM "subdomains";
ALTER TABLE "subdomains" DROP CONSTRAINT "subdomains_tunnel_id_tunnels_id_fk";
--> statement-breakpoint
DROP INDEX "subdomains_tunnelId_idx";--> statement-breakpoint
ALTER TABLE "subdomains" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subdomains" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subdomains" ADD CONSTRAINT "subdomains_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subdomains" ADD CONSTRAINT "subdomains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subdomains_organizationId_idx" ON "subdomains" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subdomains_userId_idx" ON "subdomains" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "subdomains" DROP COLUMN "tunnel_id";