const { config } = require("../../jest.config.base");

module.exports = config({
  // Load canvas mock for PIXI.JS
  testEnvironment: 'jsdom'
  // setupFiles: ["jest-canvas-mock"]
});
