"use strict";

const { inspect } = require("util");
const { irParser } = require("./dist/intermediate-parser");

const log = (str) => console.log(inspect(str, { compact: true, colors: true, depth: 4 }));

const str = `> searchIdentifiersInBlockAndFunctions > 
    Node(FunctionDeclaration) /-async | Node(BlockStatement) >
    Node(VariableDeclaration) /kind=let >
    Node(Identifier) : { name } !`;

// const str = "Node(Identufier)";
console.log(`\nAST Pattern: ${str}\n`);

const it = irParser(str);
log([...it])
console.log("\n");

// const instance = hrParser([
//     createPattern("Node(*) > Node(FunctionDeclaration) : { async, generator, params }", { label: "functionDeclarator" }),
//     createPattern("> functionDeclarator > Node(A) | Node(B) > Node(Identifier) : { name } !", { label: "findIdentifierName" })
// ]);
// instance.optimizePaths();

// for (const { label, node } of instance.walkOnSourceCode(sourceCode)) {
//     switch(label) {
//         case "functionDeclarator":
//             console.log(node.params);
//             break;
//         case "findIdentifierName":
//             console.log(node.name);
//             break;
//     }
// }
