
export const END_OF_SEQUENCE = Symbol();
export type SEQUENCE_OR_TOKEN<T> = typeof END_OF_SEQUENCE | T;

export const CONSTANTS = Object.freeze({
    IDENTIFIERS: new Set<string>(["Node"]),
    ESTREE: new Set<string>([
        "Identifier",
        "Literal",
        "RegExpLiteral",
        "Program",
        "Function",
        "ExpressionStatement",
        "BlockStatement",
        "EmptyStatement",
        "DebuggerStatement",
        "WithStatement",
        "ReturnStatement",
        "LabeledStatement",
        "BreakStatement",
        "ContinueStatement",
        "IfStatement",
        "SwitchStatement",
        "SwitchCase",
        "ThrowStatement",
        "TryStatement",
        "CatchClause",
        "WhileStatement",
        "DoWhileStatement",
        "ForStatement",
        "ForInStatement",
        "ForOfStatement",
        "Super",
        "SpreadElement",
        "ArrowFunctionExpression",
        "YieldExpression",
        "TemplateLiteral",
        "TaggedTemplateExpression",
        "TemplateElement",
        "Property",
        "ObjectPattern",
        "ArrayPattern",
        "RestElement",
        "AssignmentPattern",
        "ClassBody",
        "MethodDefinition",
        "ClassDeclaration",
        "ClassExpression",
        "MetaProperty",
        "ImportDeclaration",
        "ImportSpecifier",
        "ImportDefaultSpecifier",
        "ImportNamespaceSpecifier",
        "ExportNamedDeclaration",
        "ExportSpecifier",
        "FunctionDeclaration",
        "ExportDefaultDeclaration",
        "ExportAllDeclaration",
        "VariableDeclaration",
        "VariableDeclarator",
        "ThisExpression",
        "ArrayExpression",
        "ObjectExpression",
        "Property",
        "FunctionExpression",
        "UnaryExpression",
        "UpdateExpression",
        "BinaryExpression",
        "AssignmentExpression",
        "LogicalExpression",
        "MemberExpression",
        "ConditionalExpression",
        "CallExpression",
        "NewExpression",
        "SequenceExpression",
        "AwaitExpression",
        "BigIntLiteral",
        "ChainExpression",
        "ChainElement",
        "ImportExpression"
    ]),
    SYMBOLS: new Set<string>([
        "*", ">",
        ":", "|",
        "{", "}",
        ",", "!",
        "/", "="
    ])
});

export function getNextItem<T>(iterator: IterableIterator<T>): SEQUENCE_OR_TOKEN<T> {
    const item = iterator.next();

    return item.done ? END_OF_SEQUENCE : item.value;
}

export function charSet(...plages: (number | string | [number, number])[]): Set<string> {
    const ret = new Set<string>();
    for (const plage of plages) {
        if (typeof plage === "number") {
            ret.add(String.fromCharCode(plage));
            continue;
        }
        else if (typeof plage === "string") {
            ret.add(plage);
            continue;
        }

        for (let tid: number = plage[0]; tid <= plage[1]; tid++) {
            ret.add(String.fromCharCode(tid));
        }
    }

    return ret;
}
