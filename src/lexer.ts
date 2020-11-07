// DEPENDENCIES
import { CONSTANTS, END_OF_SEQUENCE, SEQUENCE_OR_TOKEN, getNextItem } from "./utils";

// TYPES
export type token = [symbol, string];

export const LEXER_TOKENS = Object.freeze({
    WORD: Symbol("WORD"),
    SYMBOL: Symbol("SYMBOL"),
    IDENTIFIER: Symbol("IDENTIFIER"),
    TYPE: Symbol("TYPE")
});

export function* tokenize(chars: string): IterableIterator<token> {
    const iterator: IterableIterator<string> = chars[Symbol.iterator]();
    let ch: SEQUENCE_OR_TOKEN<string>;
    let inQuote = false;

    do {
        ch = getNextItem(iterator);

        if (ch === "'") {
            inQuote = true;
            continue;
        }
        else if (inQuote || isWordChar(ch)) {
            let word = '';
            do {
                word += ch as string;
                ch = getNextItem(iterator);
                if (ch === "'") {
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
    return typeof char === 'string' && /^[A-Za-z0-9-_.]$/.test(char);
}
