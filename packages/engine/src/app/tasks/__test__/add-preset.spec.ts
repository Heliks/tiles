import { Preset } from '../../../ecs';
import { App } from '../../app';
import { AddPreset } from '../add-preset';


class Foo implements Preset {
  compose = jest.fn();
}

describe('AddPreset', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe('when resolving preset instance', () => {
    it('should create preset types using the apps service container', () => {
      const service = new Foo();

      app.container.make = jest.fn((): any => service);

      const result = new AddPreset('foo', Foo).getPreset(app);

      expect(result).toBe(service);
    });

    it('should return preset instances', () => {
      const preset = new Foo();
      const result = new AddPreset('foo', preset).getPreset(app);

      expect(result).toBe(preset);
    });
  });

  it('should add presets', () => {
    const task = new AddPreset('foo', Foo);

    task.exec(app);

    const preset = app.presets.get('foo');

    expect(preset).toBeInstanceOf(Foo);
  });

  it('should bind preset to service container', () => {
    const preset = new Foo();
    const task = new AddPreset('foo', preset);

    task.exec(app);

    expect(app.container.get(Foo)).toBe(preset);
  });
});