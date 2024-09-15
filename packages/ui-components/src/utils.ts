/** @internal */
function _formatCamelCaseSegment(segment: string, index: number): string {
  return index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Converts the given string in kebab case format into camel case.
 *
 * ```ts
 *  kebabToCamel('foo-bar') // fooBar
 *  kebabToCamel('foo-bar-foo') // fooBarFoo
 * ```
 */
export function kebabToCamel(value: string): string {
  return value.split('-').map(_formatCamelCaseSegment).join('');
}

