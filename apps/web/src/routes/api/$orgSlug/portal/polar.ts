import { createFileRoute } from "@tanstack/react-router";
import { CustomerPortal } from "@polar-sh/tanstack-start";
import { eq } from "drizzle-orm";

import { db } from "../../../../db";
import { subscriptions } from "../../../../db/subscription-schema";
import { auth } from "../../../../lib/auth";

function extractOrgSlug(request: Request): string | undefined {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  return segments[1]; // /api/:orgSlug/portal/polar => ["api", orgSlug, ...]
}

export const Route = createFileRoute("/api/$orgSlug/portal/polar")({
  server: {
    handlers: {
      GET: CustomerPortal({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        getCustomerId: async (request: Request) => {
          const orgSlug = extractOrgSlug(request);
          if (!orgSlug) {
            throw new Error("Organization slug missing");
          }

          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user) {
            throw new Error("Unauthorized");
          }

          const organizations = await auth.api.listOrganizations({
            headers: request.headers,
          });
          const organization = organizations.find(
            (org) => org.slug === orgSlug,
          );

          if (!organization) {
            throw new Error("Unauthorized");
          }

          const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.organizationId, organization.id))
            .limit(1);

          if (!subscription?.polarCustomerId) {
            throw new Error("No subscription found");
          }

          return subscription.polarCustomerId;
        },
        returnUrl: process.env.APP_URL + "/select/billing",
        server:
          process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
      }),
    },
  },
});
