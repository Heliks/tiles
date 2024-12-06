export class Lexer {

  /** The index of the character that we are currently processing. */
  public index = -1;

  /** The line which is currently processed. */
  protected line = 0;

  /**
   * @param input The input string on which this parser operates.
   */
  constructor(public readonly input: string) {}

  /** Returns the next character in `input`. Does not consume the character. */
  public peek(): string | undefined {
    return this.input[ this.index + 1];
  }

  /** Returns the current character in `input`. Does not consume the character. */
  public curr(): string | undefined {
    return this.input[ this.index ];
  }

  /** Advances the lexer and returns the next character. */
  public next(): string | undefined {
    return this.input[ ++this.index ];
  }

  /** Returns `true` if we are at the end of {@link input}. */
  public isEnd(): boolean {
    return this.index >= this.input.length - 1;
  }

}

class CSSTokenizer {

  public readonly lexer: Lexer;

  constructor(input: string) {
    this.lexer = new Lexer(input);
  }

  public tokenize() {

  }

}

const REGEX_IS_ALPHA = /^[A-Za-z]+$/;
const REGEX_IS_NUMERIC = /^[0-9\.]+$/;
const REGEX_IS_ALPHA_DASH = /^[A-Za-z\-]+$/

const CHAR_OP_ASSIGN = ':';
const CHAR_OP_TERMINATE = ';';
const CHAR_OP_FLOAT = '.';
const CHAR_WHITESPACE = ' ';

function isAlpha(char: string): boolean {
  return REGEX_IS_ALPHA.test(char);
}



function start(lexer: Lexer): string {
  let lexeme = lexer.curr();

  if (! lexeme) {
    throw new UnexpectedError();
  }

  return lexeme;
}

class UnexpectedError extends Error {

  constructor() {
    super('Unexpected error');
  }

}

class UnexpectedCharacter extends Error {

  constructor(lexer: Lexer, next = false) {
    let index = lexer.index;

    if (next) {
      index++;
    }

    super(`Syntax Error: Unexpected character "${lexer.input[index]}" at position ${index}`);
  }

}


export enum TokenType {
  /** */
  Word,
  /** Integer and floating point numbers. */
  Number,
  /** Numbers accompanied by a unit. */
  Size,
  /** Value assignment operator. */
  OPERATOR_ASSIGN,
  /** Property termination operator. */
  OPERATOR_TERMINATE
}


export interface SizeTokenValue {
  value: number;
  unit: string;
}

class Token<T extends TokenType = TokenType, V = unknown> {

  constructor(public readonly type: T, public readonly value: V) {}

}

class UnexpectedEndOfInput extends Error {

  constructor() {
    super('Unexpected end of input.');
  }

}

function collectSizeUnit(lexer: Lexer): string {
  let lexeme = start(lexer);
  let char;

  // noinspection JSAssignmentUsedAsCondition
  while(char = lexer.next()) {
    if (! REGEX_IS_ALPHA.test(char)) {
      throw new UnexpectedCharacter(lexer);
    }

    lexeme += char;

    if (lexer.peek() === CHAR_OP_TERMINATE || lexer.peek() === CHAR_WHITESPACE) {
      break;
    }
  }

  return lexeme;
}

/** Words are strings that can contain alphabetic characters and dashes. */
export type WordToken = Token<TokenType.Word, string>;

/**
 * Numeric values without a unit denomination.
 *
 * @see SizeToken
 */
export type NumberToken = Token<TokenType.Number, number>;

/**
 * Numeric values with a unit denomination. For example: `1px`, `25%`, etc. At the
 * time of parsing, the sizes unit can be arbitrary and is therefore not validated.
 *
 * @see NumberToken
 */
export type SizeToken = Token<TokenType.Size, { value: number; unit: string; }>;

function number(lexer: Lexer): NumberToken | SizeToken {
  let num = '';
  let char = lexer.curr();
  let unit;

  // noinspection JSAssignmentUsedAsCondition
  while(char) {
    if (char === CHAR_OP_FLOAT || REGEX_IS_NUMERIC.test(char)) {
      num += char;
    }
    else if (REGEX_IS_ALPHA.test(char)) {
      unit = collectSizeUnit(lexer);

      // Only terminate or end of input can be followed by a size unit.
      break;
    }
    else {
      throw new UnexpectedCharacter(lexer);
    }

    if (lexer.peek() === CHAR_OP_TERMINATE || lexer.peek() === CHAR_WHITESPACE) {
      break;
    }

    char = lexer.next()
  }

  // Convert the num lexeme into a Number.
  const value = parseFloat(num);

  // If the numeric value is accompanied by a unit, it's a size.
  return unit
    ? new Token(TokenType.Size, { unit, value })
    : new Token(TokenType.Number, value);
}



function tokenizeWord(lexer: Lexer): WordToken {
  let lexeme = start(lexer);
  let char;

  // noinspection JSAssignmentUsedAsCondition
  while(char = lexer.next()) {
    if (! REGEX_IS_ALPHA_DASH.test(char)) {
      throw new UnexpectedCharacter(lexer);
    }

    lexeme += char;

    if (
      lexer.peek() === CHAR_OP_ASSIGN ||
      lexer.peek() === CHAR_OP_TERMINATE ||
      lexer.peek() === CHAR_WHITESPACE
    ) {
      break;
    }
  }

  return new Token(TokenType.Word, lexeme);
}

function tokenize(input: string) {
  const lexer = new Lexer(input);

  let char;

  const tokens = [];

  // noinspection JSAssignmentUsedAsCondition
  while (char = lexer.next()) {
    if (isAlpha(char)) {
      tokens.push(tokenizeWord(lexer));

      continue;
    }

    if (REGEX_IS_NUMERIC.test(char)) {
      tokens.push(number(lexer));

      continue;
    }

    switch (char) {
      case ':':
        tokens.push(new Token(TokenType.OPERATOR_ASSIGN, char));
        continue;
      case ';':
        tokens.push(new Token(TokenType.OPERATOR_TERMINATE, char));
        continue;
      case ' ':
        continue;
      default:
        throw new UnexpectedCharacter(lexer);
    }
  }

  console.log(tokens);
}

describe('foo', () => {

  describe('tokenizeWord()', () => {
    function init(input: string) {
      const lexer = new Lexer(input);

      // Move lexer to start of the word.
      lexer.next();

      return lexer;
    }

    it.each([
      'foobar',
      'foo-bar',
      '-foobar',
      '--foobar',
      'foobar-',
      'foobar--'
    ])('should tokenize word %s', input => {
      const token = tokenizeWord(init(input));

      expect(token).toMatchObject(
        new Token(TokenType.Word, input)
      );
    });

    it.each([
      CHAR_OP_ASSIGN,
      CHAR_OP_TERMINATE,
      CHAR_WHITESPACE
    ])('should terminate word on "%s"', char => {
      // Create input with extra characters that are to be terminated.
      const token = tokenizeWord(init(`foo${char}bar`));

      expect(token.value).toBe('foo');
    });

    it.each([
      'foo&bar',
      'foo1234',
      'foo=bar'
    ])('should throw when word contains illegal characters %s', input => {
      expect(() => tokenizeWord(init(input))).toThrowError(UnexpectedCharacter);
    });

    it('should put lexer at the end of the word', () => {
      const lexer = init('foobar;');

      tokenizeWord(lexer);

      const next = lexer.next();

      expect(next).toBe(';');
    });
  });

  it('bar', () => {
    // tokenize('foo:bar;4px ')
    tokenize('foo: bar ;4 4 5.5px')
  });
})
