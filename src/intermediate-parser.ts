// DEPENDENCIES
import { tokenize, LEXER_TOKENS, token } from "./lexer";
import { ParsingError } from "./errors";
import { END_OF_SEQUENCE, SEQUENCE_OR_TOKEN, getNextItem } from "./utils";

// TYPES
export interface IntermediateNode {
    type: string;
    pick: string[];
}

// CONSTANTS
export const SYM_TOKENS = Object.freeze({
    PICK: Symbol("PICK"),
    NEXT: Symbol("NEXT"),
    NOR: Symbol("NOR"),
    BLOCK_START: Symbol("BSTART"),
    BLOCK_END: Symbol("BEND"),
    SPLIT: Symbol("SPLIT"),
    NONE: Symbol("NONE")
});

export function* irParser(source: string): IterableIterator<IntermediateNode> {
    const iterator = tokenize(source);
    let iteratorValue: SEQUENCE_OR_TOKEN<token>;

    do {
        if (!isNode(getNextItem(iterator))) {
            throw new ParsingError("EXPECTED_NODE");
        }
        
        const type = getNodeIdentifier(getNextItem(iterator));
        const pick: string[] = [];

        iteratorValue = getNextItem(iterator);
        if (iteratorValue !== END_OF_SEQUENCE) {
            const nextOrPickSymbol = getSymbol(iteratorValue);
            if (nextOrPickSymbol !== SYM_TOKENS.NEXT && nextOrPickSymbol !== SYM_TOKENS.PICK) {
                throw new ParsingError("EXPECTED_NEXT_OR_PICK");
            }
    
            pickBlock: if (nextOrPickSymbol === SYM_TOKENS.PICK) {
                if (type === "*") {
                    throw new ParsingError("CANNOT_PICK_WITH_STAR");
                }
                pick.push(...pickItemsName(iterator));
    
                iteratorValue = getNextItem(iterator);
                if (iteratorValue === END_OF_SEQUENCE) {
                    break pickBlock;
                }

                const nextSymbol = getSymbol(iteratorValue);
                if (nextSymbol !== SYM_TOKENS.NEXT) {
                    throw new ParsingError("EXPECTED_NEXT");
                }
            }
        }

        yield { type, pick };
    } while (iteratorValue !== END_OF_SEQUENCE);
}

function pickItemsName(iterator: IterableIterator<token>): Set<string> {
    const items = new Set<string>();
    const parenStart = getSymbol(getNextItem(iterator));
    if (parenStart !== SYM_TOKENS.BLOCK_START) {
        throw new ParsingError("PICK_START_SYMBOL");
    }

    let iterateSymbol: symbol;
    do {
        items.add(getWord(getNextItem(iterator)));
        iterateSymbol = getSymbol(getNextItem(iterator));

        if (iterateSymbol !== SYM_TOKENS.BLOCK_END && iterateSymbol !== SYM_TOKENS.SPLIT) {
            throw new ParsingError("EXPECTED_SPLIT");
        }
    } while (iterateSymbol !== SYM_TOKENS.BLOCK_END)

    return items;
}

function getNodeIdentifier(iteratorValue: SEQUENCE_OR_TOKEN<token>): string {
    if (iteratorValue === END_OF_SEQUENCE) {
        throw new ParsingError("EXPECTED_NODE_IDENTIFER");
    }

    const [token, value] = iteratorValue;
    if (token !== LEXER_TOKENS.WORD && (token === LEXER_TOKENS.SYMBOL && value !== "*")) {
        throw new ParsingError("EXPECTED_NODE_IDENTIFER");
    }

    return value; 
}

function getWord(iteratorValue: SEQUENCE_OR_TOKEN<token>): string {
    if (iteratorValue === END_OF_SEQUENCE) {
        throw new ParsingError("PREMATURE_EOS");
    }

    const [token, value] = iteratorValue;
    if (token !== LEXER_TOKENS.WORD) {
        throw new ParsingError("EXPECTED_WORD");
    }

    return value;
}

type ValueOf<T> = T[keyof T];
function getSymbol(iteratorValue: SEQUENCE_OR_TOKEN<token>, getNone = true): ValueOf<typeof SYM_TOKENS> {
    if (iteratorValue === END_OF_SEQUENCE) {
        if (getNone) {
            return SYM_TOKENS.NONE;
        }
        throw new ParsingError("EXPECTED_SYMBOL");
    }

    const [token, value] = iteratorValue;
    if (token !== LEXER_TOKENS.SYMBOL) {
        if (getNone) {
            return SYM_TOKENS.NONE;
        }
        throw new ParsingError("EXPECTED_SYMBOL");
    }

    switch (value) {
        case ">": return SYM_TOKENS.NEXT;
        case ":": return SYM_TOKENS.PICK;
        case "|": return SYM_TOKENS.NOR;
        case "{": return SYM_TOKENS.BLOCK_START;
        case "}": return SYM_TOKENS.BLOCK_END;
        case ",": return SYM_TOKENS.SPLIT;
        default:  return SYM_TOKENS.NONE;
    }
}

function isNode(iteratorValue: SEQUENCE_OR_TOKEN<token>): boolean {
    if (iteratorValue === END_OF_SEQUENCE) {
        throw new ParsingError("EXPECTED_NODE");
    }
    const [token, value] = iteratorValue;

    return token === LEXER_TOKENS.IDENTIFIER && value === "Node";
}
