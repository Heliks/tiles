import { Container } from './container';

/** @hidden */
function createContainer(x = 0, y = 0): Container {
  const container = new Container();

  container.x = x;
  container.y = y;

  return container;
}

describe('Container', () => {
  it('should shrink down to its lowest possible size', () => {
    const parent = new Container();

    // With those children the container size should be 6x6, but only (5/5) and (6/6)
    // are occupied by something.
    const childA = createContainer(5, 5);
    const childB = createContainer(6, 6);

    parent.addChild(
      childA,
      childB
    );

    parent.shrink();

    expect(childA).toEqual(expect.objectContaining({ x: 0, y: 0 }));
    expect(childB).toEqual(expect.objectContaining({ x: 1, y: 1 }));
  });

  describe('#setPivot', () => {
    // 0.5 = 50% of the container size
    const CENTER_PIVOT = 0.5;

    let container: Container;

    beforeEach(() => {
      container = new Container();

      // Pretend the container is 50x50px wide.
      jest.spyOn(container, 'height', 'get').mockReturnValue(50);
      jest.spyOn(container, 'width', 'get').mockReturnValue(50);
    })

    it('should update the pivot', () => {
      container.setPivot(CENTER_PIVOT);

      expect(container.pivot.x).toBe(25);
      expect(container.pivot.y).toBe(25);
    });

    it('should adjust the original position', () => {
      container.setPivot(CENTER_PIVOT);

      expect(container.x).toBe(25);
      expect(container.y).toBe(25);
    });
  })
});
