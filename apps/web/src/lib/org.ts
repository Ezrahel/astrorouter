import { json } from "@tanstack/react-start";
import { auth } from "./auth";

export type AuthOrganization = Awaited<
  ReturnType<typeof auth.api.listOrganizations>
>[number];

export type OrgContextResult =
  | {
      session: Awaited<ReturnType<typeof auth.api.getSession>>;
      organization: AuthOrganization;
    }
  | { error: Response };

/**
 * Resolves the organization from the slug in the URL and ensures the caller has access.
 * Returns a Response when unauthenticated/unauthorized so handlers can early-return.
 */
export async function requireOrgFromSlug(
  request: Request,
  orgSlug: string,
): Promise<OrgContextResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return { error: json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const organizations = await auth.api.listOrganizations({
    headers: request.headers,
  });

  const organization = organizations.find((org) => org.slug === orgSlug);

  if (!organization) {
    return { error: json({ error: "Unauthorized" }, { status: 403 }) };
  }

  return { session, organization };
}
