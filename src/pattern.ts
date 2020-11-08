// DEPENDENCIES
const flatstr = require("flatstr");
import * as is from "@slimio/is";
import { irParser, IR_TOKENS, IntermediateNode, label } from "./intermediate-parser";
import { END_OF_SEQUENCE, SEQUENCE_OR_TOKEN, getNextItem } from "./utils";

// CONSTANTS
const kPathTypeJointure = "->";
const kPathOrJointure = "|";
const kPathOrStartSymbol = "#";

export class Pattern {
    public source: string;
    public label: label;
    public path: string;

    constructor(patternStr: string) {
        flatstr(patternStr);
        const { label, path } = eagerCompilePattern(patternStr);

        this.source = patternStr;
        this.label = label;
        this.path = path;
    }

    initOne() {
        const iterator = irParser(this.source);
        iterator.next();

        return function walk(node: any): [boolean, string[]] {
            const pick: string[] = [];
            let isMatchingNode: boolean = false;

            while(1) {
                const item = getNextItem(iterator) as SEQUENCE_OR_TOKEN<[symbol, IntermediateNode]>;
                if (item === END_OF_SEQUENCE) {
                    break;
                }

                const [irSymbol, irNode] = item;
                isMatchingNode = createMatcher(irNode)(node);
                if (isMatchingNode) {
                    if (typeof irNode.items_to_pick !== "undefined") {
                        pick.push(...irNode.items_to_pick);
                    }
                    break;
                }

                if (irSymbol === IR_TOKENS.NODE) {
                    break;
                }
            }

            return [isMatchingNode, pick];
        }
    }
}

function createMatcher(irNode: IntermediateNode): any {
    return function isMatching(node: any): boolean {
        if (!is.plainObject(node)) {
            return false;
        }
        if (!("type" in node) || node.type !== irNode.type) {
            return false;
        }

        if (typeof irNode.properties !== "undefined") {
            const hasInvalidProperties = Object.entries(irNode.properties).some(([key, value]) => node[key] !== value);
            if (hasInvalidProperties) {
                return false;
            }
        }

        return true;
    }
}

function eagerCompilePattern(source: string): { label: string, path: string } {
    let path = "";
    let inOrSequence: boolean = false;
    const iterator = irParser(source);

    const { value: [, label] } = iterator.next();
    while(1) {
        const item = getNextItem(iterator) as SEQUENCE_OR_TOKEN<[symbol, IntermediateNode]>;
        if (item === END_OF_SEQUENCE) {
            break;
        }

        const [irSymbol, irNode] = item;
        if (irSymbol === IR_TOKENS.NODE) {
            path += `${path.length === 0 && !inOrSequence ? "" : kPathTypeJointure}${irNode.type}`;
            inOrSequence = false;
        }
        else {
            const suffix = path.length === 0 && !inOrSequence ? "" : kPathTypeJointure;
            path += `${inOrSequence ? "" : suffix}${inOrSequence ? kPathOrJointure : kPathOrStartSymbol}${irNode.type}`;
            inOrSequence = true;
        }
    }
    flatstr(path);

    return { label, path };
}
