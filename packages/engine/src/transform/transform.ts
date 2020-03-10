export class Transform {

  constructor(
    public x = 0,
    public y = 0,
    public rotation = 0
  ) {}

  public setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

}
