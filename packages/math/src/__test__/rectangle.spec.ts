import { Rectangle } from '../rectangle';


describe('Rectangle', () => {
  it.each([
    [1, 1, false],
    [5, 1, false],
    [5, 5, true]
  ])('should check if point x:%d y:%d is contained in 5x5 rectangle at x:5 y:5 (expect %s)', (x, y, expected) => {
    expect(new Rectangle(5, 5, 5, 5).contains(x, y)).toBe(expected);
  });

  it('should be scaled', () => {
    const rectangle = new Rectangle(5, 5).scale(10);

    expect(rectangle).toMatchObject({
      width: 50,
      height: 50
    });
  });

  describe('intersects()', () => {
    it('should return true when two rectangles overlap', () => {
      const rect1 = new Rectangle(10, 10, 0, 0);
      const rect2 = { width: 5, height: 5, x: 5, y: 5 };

      expect(rect1.intersects(rect2)).toBe(true);
    });

    it('should return false when two rectangles do not overlap', () => {
      const rect1 = new Rectangle(10, 10, 0, 0);
      const rect2 = { width: 5, height: 5, x: 15, y: 15 };

      expect(rect1.intersects(rect2)).toBe(false);
    });

    it('should return true when one rectangle is fully contained within the other', () => {
      const rect1 = new Rectangle(10, 10, 0, 0);
      const rect2 = { width: 5, height: 5, x: 2, y: 2 };

      expect(rect1.intersects(rect2)).toBe(true);
    });

    it('should return true when two rectangles touch at the edge', () => {
      const rect1 = new Rectangle(10, 10, 0, 0);
      const rect2 = { width: 5, height: 5, x: 10, y: 0 };

      expect(rect1.intersects(rect2)).toBe(true);
    });
  });
});

