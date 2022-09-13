const { config } = require("../../jest.config.base");

module.exports = config({
  setupFiles: [
    "<rootDir>/src/__test__/setup.ts"
  ]
});
