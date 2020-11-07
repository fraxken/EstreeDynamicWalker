// DEPENDENCIES
import { CONSTANTS, END_OF_SEQUENCE, SEQUENCE_OR_TOKEN, getNextItem, charSet } from "./utils";

// TYPES
export type token = [symbol, string];

// CONSTANTS
const kWordChars = charSet(
    [48, 57], // 0-9
    [65, 90], // a-z
    [97, 122], // A-Z
    "-", "_", "."
);
const kQuoteChar = "'";

export const LEXER_TOKENS = Object.freeze({
    WORD: Symbol("WORD"),
    SYMBOL: Symbol("SYMBOL"),
    IDENTIFIER: Symbol("IDENTIFIER"),
    TYPE: Symbol("TYPE")
});

export function* tokenize(chars: string): IterableIterator<token> {
    const iterator: IterableIterator<string> = chars[Symbol.iterator]();
    let ch: SEQUENCE_OR_TOKEN<string>;
    let inQuote: boolean = false;

    do {
        ch = getNextItem(iterator);

        if (ch === kQuoteChar) {
            inQuote = true;
            continue;
        }
        else if (inQuote || isWordChar(ch)) {
            let word = '';
            do {
                word += ch as string;
                ch = getNextItem(iterator);
                if (ch === kQuoteChar) {
                    inQuote = false;
                }
            } while (inQuote || isWordChar(ch));

            if (CONSTANTS.IDENTIFIERS.has(word)) {
                yield [LEXER_TOKENS.IDENTIFIER, word];
            }
            else if (CONSTANTS.ESTREE.has(word)) {
                yield [LEXER_TOKENS.TYPE, word];
            }
            else {
                yield [LEXER_TOKENS.WORD, word];
            }
        }

        if (CONSTANTS.SYMBOLS.has(ch as string)) {
            yield [LEXER_TOKENS.SYMBOL, ch as string];
        }
    } while (ch !== END_OF_SEQUENCE);
}

function isWordChar(char: any): boolean {
    return kWordChars.has(char);
}
