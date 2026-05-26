import type { Config } from "jest";

const sharedConfig = {
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json", diagnostics: false }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next/navigation$": "<rootDir>/node_modules/next/navigation",
    "^next/server$": "<rootDir>/__mocks__/next-server.js",
  },
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

const config: Config = {
  projects: [
    {
      ...sharedConfig,
      displayName: "unit",
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      testMatch: ["<rootDir>/__tests__/unit/**/*.test.{ts,tsx}"],
    },
    {
      ...sharedConfig,
      displayName: "integration",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/__tests__/integration/**/*.test.{ts,tsx}",
        "<rootDir>/__tests__/security/**/*.test.{ts,tsx}",
      ],
    },
  ],
};

export default config;
