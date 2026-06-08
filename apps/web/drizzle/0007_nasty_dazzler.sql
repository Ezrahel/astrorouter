ALTER TABLE "tunnels" ADD COLUMN "protocol" text DEFAULT 'http' NOT NULL;--> statement-breakpoint
ALTER TABLE "tunnels" ADD COLUMN "remote_port" integer;