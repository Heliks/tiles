import { clearTypeIds, setTypeId } from '../uuid';


describe('setTypeId()', () => {
  afterEach(() => {
    clearTypeIds();
  });

  class Foo {}
  class Bar {}

  it('should throw if same id is used twice', () => {
    setTypeId(Foo, '0000-0000-0000-0001');

    expect(() => setTypeId(Bar, '0000-0000-0000-0001')).toThrow();
  });

  it('should clear type ids', () => {
    setTypeId(Foo, '0000-0000-0000-0001');

    clearTypeIds();

    expect(() => setTypeId(Bar, '0000-0000-0000-0001')).not.toThrow();
  });
});
