/**
 * Template tag that removes all indentation from a string.
 *
 * This is mostly used as convenience for error messages so that they can be formatted
 * in code if they are to long. For example:
 *
 * ```ts
 *  function foo() {
 *    throw new Error(`Super long error happened: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore...`);
 *  }
 * ```
 *
 * Becomes this:
 *
 * ```ts
 *  function foo() {
 *    throw new Error(noIndent`
 *      Super long error happened: Lorem ipsum dolor sit amet, consectetur adipiscing
 *      elit, sed do eiusmod tempor incididunt ut labore...
 *    `);
 *  }
 * ```
 */
export function noIndent(strings: TemplateStringsArray, ...values: unknown[]): string {
  const size = Math.max(strings.length, values.length);

  let result = '';

  for (let i = 0; i < size; i++) {
    result += strings[i].replace(/\s+/gm, ' ');
    result += values[i] ?? '';
  }

  result = result.trim();

  return result;
}
