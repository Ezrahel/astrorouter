import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AstroRouter - Expose your local server to the internet" },
    ],
  }),
  component: Landing,
});
