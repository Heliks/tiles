import { World } from '../world';

describe('World', () => {
  let world: World;

  class A {
  }

  class B {
  }

  beforeEach(() => {
    world = new World();
  });

  it('should register component storages', () => {
    const storage1 = world.register(A);
    const storage2 = world.register(A);
    const storage3 = world.register(A);

    expect(storage1.id).toBe(1);
    expect(storage2.id).toBe(2);
    expect(storage3.id).toBe(4);
  });

  it('should create compositions', () => {
    const storageA = world.storage(A);
    const storageB = world.storage(B);

    const composition = world.createComposition([A, B]);

    expect(composition.has(storageA.id)).toBeTruthy();
    expect(composition.has(storageB.id)).toBeTruthy();
  });
});
