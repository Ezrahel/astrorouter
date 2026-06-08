import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    external: ["@nestjs/common", "@nestjs/core"],
    splitting: false,
    sourcemap: true,
});
