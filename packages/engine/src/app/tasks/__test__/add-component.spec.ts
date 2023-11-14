import { App } from '../../app';
import { AddComponent } from '../add-component';


describe('AddComponent', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  it('should register a component type', () => {
    class Foo {}

    const mock = jest.fn();
    const task = new AddComponent(Foo);

    app.world.register = mock;

    task.exec(app);

    expect(mock).toHaveBeenCalledWith(Foo);
  });
});