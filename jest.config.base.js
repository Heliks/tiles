/**
 * Default configuration for ts-jest projects.
 */
// noinspection JSUnresolvedVariable
module.exports = {
  "verbose": true,
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
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
  ]
};
