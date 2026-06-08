import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "AstroRoute",
    },
    themeSwitch: {
      enabled: false,
    },
  };
}
