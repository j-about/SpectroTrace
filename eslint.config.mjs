/**
 * @fileoverview ESLint configuration for SpectroTrace.
 *
 * Uses flat config format with:
 * - Next.js core web vitals rules
 * - Next.js TypeScript rules
 * - Prettier integration (disables conflicting rules)
 *
 * @module eslint.config
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * ESLint configuration array using flat config format.
 * Combines Next.js recommended rules with Prettier formatting.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/sw.js"]),
]);

export default eslintConfig;
