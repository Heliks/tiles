/** Default configuration for ts-jest projects. */
const DEFAULT_TEST_CONFIG = {
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
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid')
  },
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],
  modulePathIgnorePatterns: [
    "node_modules"
  ]
};

/**
 * Merges the default test configuration with the given `config`. If no config is given,
 * the default config is returned.
 *
 * @see DEFAULT_TEST_CONFIG
 * @returns {Object}
 */
function config(config) {
  return config ? { ...DEFAULT_TEST_CONFIG, ...config } : DEFAULT_TEST_CONFIG;
}

module.exports = {
  config
};

