const { config } = require("../../jest.config.base");

module.exports = config({
  setupFiles: ["jest-canvas-mock"],
  testEnvironment: 'jsdom'
});
