module.exports = {
  ...require('../../jest.config.base'),
  // Load canvas mock for PIXI.JS
  setupFiles: ["jest-canvas-mock"]
}
