const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const customConfig = {
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react" } }],
  },
};

module.exports = createJestConfig(customConfig);