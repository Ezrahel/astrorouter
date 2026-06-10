import { createFileRoute } from "@tanstack/react-router";
import { NestJSPluginLanding } from "@/components/landing/nestjs-plugin/NestJSPluginLanding";

export const Route = createFileRoute("/nestjs")({
  head: () => ({
    meta: [
      { title: "NestJS Plugin - AstroRoute" },
    ],
  }),
  component: NestJSPluginLanding,
});
