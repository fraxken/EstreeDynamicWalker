"use strict";

const { irParser } = require("./dist/intermediate-parser");

// const str = "> label > Node(A) | Node(B) > Node(Identifier) : { name } !";
const str = "> test > Node(BlockStatement) | Node(CallExpression) > Node(Identifier): { name } !";
console.log(`\nParsing string: ${str}\n`);
const it = irParser(str);
console.log([...it]);

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
