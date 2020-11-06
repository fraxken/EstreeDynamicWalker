
import { tokenize, kLexerTokens, token } from "./lexer";

type intermediateToken = typeof kEndOfSequence | token;
interface intermediateNode {
    type: string;
    pick: string[];
}

// CONSTANTS
const kEndOfSequence = Symbol();
const kSymbolTokens = Object.freeze({
    PICK: Symbol("PICK"),
    NEXT: Symbol("NEXT"),
    NOR: Symbol("NOR"),
    BLOCK_START: Symbol("BSTART"),
    BLOCK_END: Symbol("BEND"),
    SPLIT: Symbol("SPLIT"),
    NONE: Symbol()
});

function* intermediateParser(source: string): IterableIterator<intermediateNode> {
    const iterator = tokenize(source);
    let iteratorValue: intermediateToken;

    do {
        if (!isNode(getNextItem(iterator))) {
            throw new Error("TBC");
        }
        
        const type = getNodeIdentifier(getNextItem(iterator));
        const pick: string[] = [];

        iteratorValue = getNextItem(iterator);
        if (iteratorValue !== kEndOfSequence) {
            const nextOrPickSymbol = getSymbol(iteratorValue);
            if (nextOrPickSymbol !== kSymbolTokens.NEXT && nextOrPickSymbol !== kSymbolTokens.PICK) {
                throw new Error("INVALID SYMBOL AFTER NODE ID");
            }
    
            pickBlock: if (nextOrPickSymbol === kSymbolTokens.PICK) {
                pick.push(...pickItemsName(iterator));
    
                iteratorValue = getNextItem(iterator);
                if (iteratorValue == kEndOfSequence) {
                    break pickBlock;
                }

                const nextSymbol = getSymbol(iteratorValue);
                if (nextSymbol !== kSymbolTokens.NEXT) {
                    throw new Error("INVALID SYMBOL AFTER NODE ID");
                }
            }
        }

        yield { type, pick };
    } while (iteratorValue !== kEndOfSequence);
}

function pickItemsName(iterator: IterableIterator<token>): Set<string> {
    const items = new Set<string>();
    const parenStart = getSymbol(getNextItem(iterator));
    if (parenStart !== kSymbolTokens.BLOCK_START) {
        throw new Error("INVALID ITEM BLOCK START!");
    }

    let iterateSymbol: symbol;
    do {
        const currIterate = getNextItem(iterator);
        if (currIterate === kEndOfSequence) {
            throw new Error("INVALID END OF SEQUENCE");
        }

        const [token, value] = currIterate as token;
        if (token !== kLexerTokens.WORD) {
            throw new Error("EXPECTED WORD!");
        }
        items.add(value);

        iterateSymbol = getSymbol(getNextItem(iterator));
        if (iterateSymbol !== kSymbolTokens.BLOCK_END && iterateSymbol !== kSymbolTokens.SPLIT) {
            throw new Error("INVALID ITEM SPLIT!");
        }
    } while (iterateSymbol !== kSymbolTokens.BLOCK_END)

    return items;
}

function getNodeIdentifier(iteratorValue: intermediateToken): string {
    const [token, value] = iteratorValue as token;
    if (token !== kLexerTokens.WORD && (token === kLexerTokens.SYMBOL && value !== "*")) {
        throw new Error("NOT A NODE IDENTIFIER!");
    }

    return value; 
}

function getSymbol(iteratorValue: intermediateToken): symbol {
    const [token, value] = iteratorValue as token;
    if (token !== kLexerTokens.SYMBOL) {
        throw new Error("INVALID SYMBOL!");
    }

    switch (value) {
        case ">": return kSymbolTokens.NEXT;
        case ":": return kSymbolTokens.PICK;
        case "|": return kSymbolTokens.NOR;
        case "{": return kSymbolTokens.BLOCK_START;
        case "}": return kSymbolTokens.BLOCK_END;
        case ",": return kSymbolTokens.SPLIT;
        default:  return kSymbolTokens.NONE;
    }
}

function isNode(iteratorValue: intermediateToken): boolean {
    const [token, value] = iteratorValue as token;

    return token === kLexerTokens.IDENTIFIER && value === "Node";
}

function getNextItem(iterator: IterableIterator<token>): intermediateToken {
    const item = iterator.next();

    return item.done ? kEndOfSequence : item.value;
}

const it = intermediateParser("Node(*) > Node(Identifier) : { name }");
for (const node of it) {
    console.log(node);
}
