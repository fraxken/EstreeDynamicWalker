
// DEPENDENCIES
import ExtendableError from "es6-error";

export const ParsingCodes = Object.freeze({
    EXPECTED_NODE: "Expected a 'Node()' Identifier token at the beginning of the block.",
    EXPECTED_ESTREE_TYPE: "Expected a valid 'ESTREE Type' or a Symbol token '*' for the adjacent Node type.",
    EXPECTED_WORD: "Expected a WORD Token.",
    EXPECTED_AN_ACTION_SYMBOL: `Expected an action Symbol for the current block: Next '>', Pick ':' or Skip '!' and finally OR '|'`,
    EXPECTED_COMMA: "Expecting a COMMA Symbol ',' between each Pickable items.",
    EXPECTED_EOS: "Expected an End of sequence after a Pick.",
    EXPECTED_NEXT: "Expected a Next '>' Symbol.",
    PICK_START_SYMBOL: "Pick block must always start with the Symbol token '{'.",
    PREMATURE_EOS: "Premature End of sequence detected!",
    INVALID_STAR_NODE: "A star Symbol token 'Node(*)' cannot be mixed with Pick ':' and OR '|' action Symbols.",
    INVALID_LABEL: "Failed to parse LABEL at the start of the pattern. Label must be syntaxed as '> WORD >'."
});

export type KeyCode = keyof typeof ParsingCodes;

export class ParsingError extends ExtendableError {
    public code: KeyCode;

    constructor(code: KeyCode, customMessage: string = "") {
        super(ParsingCodes[code] + customMessage);
        this.code = code;
    }
}
