/**
 * Node(*) > Node(MemberExpression) |
 * Node(*) > Node(Identifier) : { name }
 */

export type token = [symbol, string];
export type characters = "symbol" | "wordchar" | "none";

// CONSTANTS
const kIdentifierWords = new Set(["node"]);
const kSymbolsCharacters = new Set(["*", ">", ":", "|", "{", "}", ","]);
const kEndOfSequence = Symbol();

export const kLexerTokens = Object.freeze({
    WORD: Symbol(),
    SYMBOL: Symbol(),
    IDENTIFIER: Symbol()
});

export function* tokenize(chars: string): IterableIterator<token> {
    const iterator: IterableIterator<string> = chars[Symbol.iterator]();
    let ch: typeof kEndOfSequence | string;

    do {
        ch = getNextItem(iterator);
        switch(charType(ch)) {
            case "wordchar": {
                let word = '';
                do {
                    word += ch as string;
                    ch = getNextItem(iterator);
                } while (isWordChar(ch));

                yield [kIdentifierWords.has(word.toLowerCase()) ? kLexerTokens.IDENTIFIER : kLexerTokens.WORD, word];
                break;
            }
            case "symbol":
                yield [kLexerTokens.SYMBOL, ch as string];
                break;
        }
    } while (ch !== kEndOfSequence);
}

function getNextItem(iterator: IterableIterator<string>): typeof kEndOfSequence | string {
    const item = iterator.next();

    return item.done ? kEndOfSequence : item.value;
}

function charType(char: any): characters {
    if (kSymbolsCharacters.has(char)) {
        return "symbol";
    }

    return isWordChar(char) ? "wordchar" : "none";
}

function isWordChar(char: any): boolean {
    return typeof char === 'string' && /^[A-Za-z0-9]$/.test(char);
}
