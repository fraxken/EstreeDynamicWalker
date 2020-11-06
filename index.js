"use strict";

const { irParser } = require("./dist/intermediate-parser");

const it = irParser("Node(Identifier) : { name, boo }");
console.log([...it]);
