const { config } = require("../../jest.config.base");

module.exports = config({
  setupFiles: ['./src/test.ts']
});
