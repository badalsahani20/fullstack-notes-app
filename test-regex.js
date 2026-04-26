const rawText = `Here is a flowchart:

[IRIS_VIZ type="mermaid"
title="Feature Development Process"]
\`\`\`mermaid
flowchart TD
A-->B
\`\`\`
[/IRIS_VIZ]

Hope this helps!`;

// The regex currently in parseIrisResponse.js
const VIZ_REGEX = /\[IRIS_VIZ\s+type=["']?(\w+)["']?\s+title=["']?([^"\]]+)["']?\s*\]([\s\S]*?)\[\/IRIS_VIZ\]/g;

let match;
let found = false;
while((match = VIZ_REGEX.exec(rawText)) !== null) {
  console.log('MATCH FOUND!');
  console.log('Type:', match[1]);
  console.log('Title:', match[2]);
  console.log('Data:', match[3].trim());
  found = true;
}

if (!found) console.log('NO MATCH FOUND.');
