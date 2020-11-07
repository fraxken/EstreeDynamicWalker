
// DEPENDENCIES
import { CONSTANTS } from "./utils";

export const ParsingCodes = Object.freeze({
    EXPECTED_NODE: "Expected a 'Node' Identifier",
    EXPECTED_NODE_IDENTIFER: "Expected a valid 'ESTREE Type' or a Symbol '*' for the Node name.",
    EXPECTED_SYMBOL: `Expected one of the following Symbol (${[...CONSTANTS.SYMBOLS].join(", ")})`,
    EXPECTED_WORD: "Expected a WORD.",
    EXPECTED_END_SYMBOL: `Expected an ending Symbol: Next '>', Pick ':' or Skip '!'`,
    EXPECTED_COMMA: "Expected a COMMA Symbol ','.",
    EXPECTED_EOS: "Expected an End of sequence after a Pick.",
    EXPECTED_NEXT: "Expected a Next '>' Symbol.",
    CANNOT_PICK_WITH_STAR: "Impossible to pick properties when the Node Identifier is equal to '*'!",
    PICK_START_SYMBOL: "Pick block must start with the Symbol '{'.",
    PREMATURE_EOS: "Premature End of sequence detected!"
});

export type KeyCode = keyof typeof ParsingCodes;

export class ParsingError extends Error {
    public code: KeyCode;

    constructor(code: KeyCode) {
        super(ParsingCodes[code]);
        this.code = code;
    }
}
