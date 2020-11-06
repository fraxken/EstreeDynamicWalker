"use strict";

const { irParser } = require("./dist/intermediate-parser");

const it = irParser("Node(Identifier) : { name, boo } > Node(Expr) > Node(Yolo) : { prop1 }");
console.log([...it]);
