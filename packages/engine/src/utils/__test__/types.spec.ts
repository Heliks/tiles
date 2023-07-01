import { isType } from '../types';


describe('isType', () => {
  class Foo {
    constructor() {}
  }

  it('it should return true if a value is a class type', () => {
    expect(isType(Foo)).toBeTruthy();
  });

  it('should return false if a value is not a class type', () => {
    expect(isType(new Foo())).toBeFalsy();
  });

});

