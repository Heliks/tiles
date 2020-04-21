/**
 * Default configuration for ts-jest projects.
 */
// noinspection JSUnresolvedVariable
module.exports = {
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testMatch: [
    "**/*.spec.ts"
  ],
  setupFiles: [],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  modulePathIgnorePatterns: [
    "node_modules"
  ],
  verbose: true
};
