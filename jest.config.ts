import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@ports/(.*)$": "<rootDir>/src/ports/$1",
    "^@test/(.*)$": "<rootDir>/src/test/$1",
    "^@libs/(.*)$": "<rootDir>/src/libs/$1",
  },
};

export default config;
