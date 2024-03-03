export type NumberOptionValue = number | undefined;

export class NumberOption {

  constructor(public value?: number) {}

  public sub(value: number): this {
    if (this.value !== undefined) {
      this.value -= value;
    }

    return this;
  }

}
