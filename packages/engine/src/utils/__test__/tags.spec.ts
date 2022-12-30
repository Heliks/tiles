import { noIndent } from '../tags';


describe('noIndent', () => {
  it.each([
    () => noIndent` A ${'B'} 
                    C ${'D'}`,
    () => noIndent` A ${'B'} 
                    ${'C'} D`,
    () => noIndent` ${'A'}    ${'B'} 
                    ${'C'}    
                      D`
  ])('should remove indents from template strings', factory => {
    expect(factory()).toBe('A B C D');
  });
});
