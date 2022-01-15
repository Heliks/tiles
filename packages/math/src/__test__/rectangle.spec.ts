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
});