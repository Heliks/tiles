const { config } = require("../../jest.config.base");

module.exports = config({
  testEnvironment: 'jsdom',
  setupFiles: ["jest-canvas-mock"]
});
