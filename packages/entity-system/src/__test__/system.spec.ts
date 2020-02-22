import { System, SystemManager } from '../system';

describe('system', () => {
  let mgr: SystemManager;

  beforeEach(() => {
    mgr = new SystemManager();
  });

  class SystemMock implements System {
    boot = jest.fn();
    update = jest.fn();
  }

  it('should boot systems', () => {
    const sys = new SystemMock();

    // System should be booted when it is added to the manager.
    mgr.add(sys);

    expect(sys.boot).toHaveBeenCalledWith(mgr.world);
  });

  it('should update all systems', () => {
    const sys1 = new SystemMock();
    const sys2 = new SystemMock();

    mgr.add(sys1);
    mgr.add(sys2);

    mgr.update();

    expect(sys1.update).toHaveBeenCalledWith(mgr.world);
    expect(sys2.update).toHaveBeenCalledWith(mgr.world);
  });
});
