// DEPENDENCIES
const flatstr = require("flatstr");
import levenshtein from "fast-levenshtein";
import { tokenize, LEXER_TOKENS, token } from "./lexer";
import { ParsingError } from "./errors";
import { END_OF_SEQUENCE, SEQUENCE_OR_TOKEN, getNextItem, CONSTANTS } from "./utils";

// TYPES
export type label = string | null;
export type IntermediateToken = label | IntermediateNode | IntermediateNode[];
export type IntermediateProperties = Record<string, string | boolean>;
export interface IntermediateNode {
    type: string;
    properties?: IntermediateProperties;
    items_to_pick?: string[];
    skip?: boolean;
}

export const IR_TOKENS = Object.freeze({
    LABEL: Symbol("LABEL"),
    NODE: Symbol("NODE"),
    OR_NODE: Symbol("OR_NODE")
});

// CONSTANTS
export const SYM_TOKENS = Object.freeze({
    PICK: Symbol("PICK"), // :
    NEXT: Symbol("NEXT"), // >
    OR: Symbol("OR"), // |
    BLOCK_START: Symbol("BSTART"), // {
    BLOCK_END: Symbol("BEND"), // }
    COMMA: Symbol("COMMA"), // ,
    SKIP: Symbol("SKIP"), // !
    CHECK_PROPERTY: Symbol("CHECK_PROPERTY"), // /
    EQUAL: Symbol("EQUAL"), // =
    NONE: Symbol("NONE") // ¯\_(ツ)_/¯
});

const kValidSymbolsAfterNode = new Set([SYM_TOKENS.PICK, SYM_TOKENS.NEXT, SYM_TOKENS.SKIP, SYM_TOKENS.OR]);

export function* irParser(source: string): IterableIterator<[ValueOf<typeof IR_TOKENS>, IntermediateToken]> {
    flatstr(source);
    const startWithLabel = source.length > 0 && source.charAt(0) === ">";
    const iterator = tokenize(source);

    // Extract label
    yield [IR_TOKENS.LABEL, startWithLabel ? getLabel(iterator) : null];

    let orActivated: boolean = false;
    while(1) {
        let iteratorValue: SEQUENCE_OR_TOKEN<token> = getNextItem(iterator);
        if (iteratorValue === END_OF_SEQUENCE) {
            break;
        }

        if (!isNode(iteratorValue)) {
            throw new ParsingError("EXPECTED_NODE");
        }
        const node: IntermediateNode = {
            type: getNodeIdentifier(getNextItem(iterator))
        };

        iteratorValue = getNextItem(iterator);
        if (iteratorValue === END_OF_SEQUENCE) {
            yield [IR_TOKENS.NODE, node];
            break;
        }

        let [nextSymbol, properties] = getNodeProperties(iterator, iteratorValue);
        if (properties.size > 0) {
            node.properties = Object.fromEntries(properties);
        }
        if (!kValidSymbolsAfterNode.has(nextSymbol)) {
            throw new ParsingError("EXPECTED_AN_ACTION_SYMBOL");
        }

        if ((nextSymbol === SYM_TOKENS.PICK || nextSymbol === SYM_TOKENS.OR) && node.type === "*") {
            throw new ParsingError("INVALID_STAR_NODE");
        }

        if (nextSymbol === SYM_TOKENS.PICK) {
            node.items_to_pick = [...iteratePickableItems(iterator)];
            nextSymbol = getSymbol(getNextItem(iterator));

            if (nextSymbol !== SYM_TOKENS.NONE && nextSymbol !== SYM_TOKENS.SKIP) {
                throw new ParsingError("EXPECTED_EOS", " (At the end of the current pattern.)");
            }
        }
        else if (nextSymbol === SYM_TOKENS.OR) {
            orActivated = true;
            yield [IR_TOKENS.OR_NODE, node];
            continue;
        }

        let breakLoop = false;
        if (nextSymbol === SYM_TOKENS.SKIP) {
            node.skip = true;
            breakLoop = true;
        }

        if (orActivated) {
            orActivated = false;
            yield [IR_TOKENS.OR_NODE, node];
        }
        else {
            yield [IR_TOKENS.NODE, node];
        }
        if (breakLoop) break;
    }
}

function iteratePickableItems(iterator: IterableIterator<token>): Set<string> {
    const items = new Set<string>();
    const parenStart = getSymbol(getNextItem(iterator));
    if (parenStart !== SYM_TOKENS.BLOCK_START) {
        throw new ParsingError("PICK_START_SYMBOL");
    }

    let iterateSymbol: symbol;
    do {
        items.add(getWord(getNextItem(iterator)));
        iterateSymbol = getSymbol(getNextItem(iterator));

        if (iterateSymbol !== SYM_TOKENS.BLOCK_END && iterateSymbol !== SYM_TOKENS.COMMA) {
            throw new ParsingError("EXPECTED_COMMA");
        }
    } while (iterateSymbol !== SYM_TOKENS.BLOCK_END)

    return items;
}

function getNodeProperties(iterator: IterableIterator<token>, iteratorValue: token): [symbol, Map<string, string | boolean>] {
    const properties: Map<string, string | boolean> = new Map();
    let nextSymbol = getSymbol(iteratorValue);

    while(1) {
        if (nextSymbol !== SYM_TOKENS.CHECK_PROPERTY) {
            break;
        }
        const propertyName = getWord(getNextItem(iterator));
        nextSymbol = getSymbol(getNextItem(iterator));

        switch (nextSymbol) {
            case SYM_TOKENS.EQUAL: {
                const propertyValue = getWord(getNextItem(iterator));
                properties.set(propertyName, propertyValue);
                nextSymbol = getSymbol(getNextItem(iterator));

                break;
            }
            case SYM_TOKENS.NEXT:
            case SYM_TOKENS.PICK:
            case SYM_TOKENS.SKIP:
            case SYM_TOKENS.OR:
            case SYM_TOKENS.CHECK_PROPERTY: {
                const isPositive = propertyName.charAt(0) !== "-";
                properties.set(isPositive ? propertyName : propertyName.slice(1), isPositive);
                break;
            }
        }
    }

    return [nextSymbol, properties];
}

function getLabel(iterator: IterableIterator<token>): string {
    const startSymbol = getSymbol(getNextItem(iterator));
    if (startSymbol !== SYM_TOKENS.NEXT) {
        throw new ParsingError("INVALID_LABEL");
    }
    
    let label: string;
    try {
        label = getWord(getNextItem(iterator));
    }
    catch {
        throw new ParsingError("INVALID_LABEL");
    }

    const endSymbol = getSymbol(getNextItem(iterator));
    if (endSymbol !== SYM_TOKENS.NEXT) {
        throw new ParsingError("INVALID_LABEL");
    }

    return label;
}

function getNodeIdentifier(iteratorValue: SEQUENCE_OR_TOKEN<token>): string {
    if (iteratorValue === END_OF_SEQUENCE) {
        throw new ParsingError("EXPECTED_ESTREE_TYPE", " Instead get End Of Sequence!");
    }

    const [token, value] = iteratorValue;
    if (token !== LEXER_TOKENS.TYPE && (token !== LEXER_TOKENS.SYMBOL || value !== "*")) {
        let customMessage: string = "";
        if (token === LEXER_TOKENS.WORD) {
            const estreeType = [...CONSTANTS.ESTREE].find((type) => levenshtein.get(type, value) <= 2);
            if (estreeType) {
                customMessage = ` Instead fetched WORD '${value}', did you mean '${estreeType}' ?`;
            }
        }
        throw new ParsingError("EXPECTED_ESTREE_TYPE", customMessage);
    }

    return value; 
}

function getWord(iteratorValue: SEQUENCE_OR_TOKEN<token>): string {
    if (iteratorValue === END_OF_SEQUENCE) {
        throw new ParsingError("PREMATURE_EOS", " (When attempting to fetch a WORD token)");
    }

    const [token, value] = iteratorValue;
    if (token !== LEXER_TOKENS.WORD) {
        throw new ParsingError("EXPECTED_WORD");
    }

    return value;
}

type ValueOf<T> = T[keyof T];
function getSymbol(iteratorValue: SEQUENCE_OR_TOKEN<token>): ValueOf<typeof SYM_TOKENS> {
    if (iteratorValue === END_OF_SEQUENCE) {
        return SYM_TOKENS.NONE;
    }

    const [token, value] = iteratorValue;
    if (token !== LEXER_TOKENS.SYMBOL) {
        return SYM_TOKENS.NONE;
    }

    switch (value) {
        case ">": return SYM_TOKENS.NEXT;
        case ":": return SYM_TOKENS.PICK;
        case "|": return SYM_TOKENS.OR;
        case "{": return SYM_TOKENS.BLOCK_START;
        case "}": return SYM_TOKENS.BLOCK_END;
        case ",": return SYM_TOKENS.COMMA;
        case "!": return SYM_TOKENS.SKIP;
        case "/": return SYM_TOKENS.CHECK_PROPERTY;
        case "=": return SYM_TOKENS.EQUAL;
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
