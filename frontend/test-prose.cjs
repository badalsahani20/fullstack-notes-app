const { JSDOM } = require("jsdom");
const dom = new JSDOM("");
global.document = dom.window.document;
global.window = dom.window;

const { Schema, DOMParser } = require("prosemirror-model");

const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { content: "inline*", group: "block", parseDOM: [{tag: "p"}] },
    text: { group: "inline" },
    codeBlock: {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
    }
  }
});

const parser = DOMParser.fromSchema(schema);

// Test 1: plain \n
let el = document.createElement("div");
el.innerHTML = "<pre>line 1\nline 2</pre>";
let doc1 = parser.parse(el);
console.log("Test 1 text:", JSON.stringify(doc1.child(0).textContent));

// Test 2: \n\n
el.innerHTML = "<pre>line 1\n\nline 2</pre>";
let doc2 = parser.parse(el);
console.log("Test 2 text:", JSON.stringify(doc2.child(0).textContent));
