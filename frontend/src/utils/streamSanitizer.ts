/**
 * Utility to auto-close and repair incomplete markup, code blocks, JSON/XML tags,
 * unmatched brackets, and LaTeX expressions during live streaming or incomplete generation.
 */

/**
 * Automatically closes any open markdown code blocks (```).
 */
export function closeIncompleteCodeBlocks(text: string): string {
  const lines = text.split("\n");
  let insideCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
    }
  }

  if (insideCodeBlock) {
    return text + "\n```";
  }
  return text;
}

/**
 * Automatically closes unmatched opening brackets ([ ( {) outside of code blocks/inline code.
 */
export function closeUnmatchedBrackets(text: string): string {
  const stack: string[] = [];
  let insideCodeBlock = false;
  let insideInlineCode = false;

  let i = 0;
  while (i < text.length) {
    if (text.startsWith("```", i)) {
      insideCodeBlock = !insideCodeBlock;
      i += 3;
      continue;
    }

    if (text[i] === "`" && !insideCodeBlock) {
      insideInlineCode = !insideInlineCode;
      i++;
      continue;
    }

    if (insideCodeBlock || insideInlineCode) {
      i++;
      continue;
    }

    const char = text[i];
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
    } else if (char === ")") {
      if (stack[stack.length - 1] === "(") stack.pop();
    } else if (char === "]") {
      if (stack[stack.length - 1] === "[") stack.pop();
    } else if (char === "}") {
      if (stack[stack.length - 1] === "{") stack.pop();
    }

    i++;
  }

  let closing = "";
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === "(") closing += ")";
    if (open === "[") closing += "]";
    if (open === "{") closing += "}";
  }

  return text + closing;
}

/**
 * Automatically closes unclosed LaTeX $ or $$ blocks.
 */
export function closeLaTeX(text: string): string {
  let cleanText = "";
  let insideCodeBlock = false;
  const lines = text.split("\n");
  
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
    }
    if (!insideCodeBlock) {
      cleanText += line + "\n";
    }
  }

  // Count $$ occurrences
  const doubleDollarCount = (cleanText.match(/\$\$/g) || []).length;
  if (doubleDollarCount % 2 !== 0) {
    return text + "\n$$";
  }

  // Count $ occurrences (excluding $$)
  const singleText = cleanText.replace(/\$\$/g, "");
  const singleDollarCount = (singleText.match(/\$/g) || []).length;
  if (singleDollarCount % 2 !== 0) {
    const lastDollarIndex = text.lastIndexOf("$");
    if (lastDollarIndex !== -1 && lastDollarIndex < text.length - 1) {
      const charAfter = text[lastDollarIndex + 1];
      if (/^[a-zA-Z\\{(_]/.test(charAfter)) {
        return text + "$";
      }
    }
  }
  return text;
}

/**
 * Automatically closes unclosed string quotes and curly/square braces in uncompleted json code blocks.
 */
export function closeUnfinishedJson(text: string): string {
  const jsonBlockRegex = /```(json|comparison)\s*\n([\s\S]*?)$/;
  const match = text.match(jsonBlockRegex);
  if (match) {
    const jsonContent = match[2];
    const stack: string[] = [];
    let insideString = false;
    let escape = false;

    for (let i = 0; i < jsonContent.length; i++) {
      const char = jsonContent[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') {
        insideString = !insideString;
        continue;
      }
      if (insideString) {
        continue;
      }
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        if (stack[stack.length - 1] === "{") stack.pop();
      } else if (char === "]") {
        if (stack[stack.length - 1] === "[") stack.pop();
      }
    }

    let closing = "";
    if (insideString) {
      closing += '"';
    }
    while (stack.length > 0) {
      const open = stack.pop();
      if (open === "{") closing += "}";
      if (open === "[") closing += "]";
    }
    return text + closing;
  }
  return text;
}

/**
 * Automatically closes unmatched HTML/XML tags.
 */
export function closeHtmlTags(text: string): string {
  const stack: string[] = [];
  const tagRegex = /<(\/)?([a-zA-Z0-9:-]+)(?:\s+[^>]*?)?(\/)?>/g;
  let insideCodeBlock = false;
  let insideInlineCode = false;

  let cleanText = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("```", i)) {
      insideCodeBlock = !insideCodeBlock;
      i += 3;
      continue;
    }
    if (text[i] === "`" && !insideCodeBlock) {
      insideInlineCode = !insideInlineCode;
      i++;
      continue;
    }
    if (!insideCodeBlock && !insideInlineCode) {
      cleanText += text[i];
    }
    i++;
  }

  let match;
  tagRegex.lastIndex = 0;
  while ((match = tagRegex.exec(cleanText)) !== null) {
    const [_, isClosing, tagName, isSelfClosing] = match;
    if (isSelfClosing) continue;

    const voidTags = ["img", "br", "hr", "input", "meta", "link"];
    if (voidTags.includes(tagName.toLowerCase())) continue;

    if (isClosing) {
      if (stack[stack.length - 1] === tagName.toLowerCase()) {
        stack.pop();
      }
    } else {
      stack.push(tagName.toLowerCase());
    }
  }

  let closing = "";
  while (stack.length > 0) {
    const tag = stack.pop();
    closing += `</${tag}>`;
  }

  return text + closing;
}

/**
 * Applies all streaming sanitizations in the correct sequence.
 */
export function sanitizeStream(text: string): string {
  if (!text) return "";
  
  let sanitized = text;
  
  // 1. Unfinished HTML tags
  sanitized = closeHtmlTags(sanitized);

  // 2. Unfinished JSON inside json code blocks
  sanitized = closeUnfinishedJson(sanitized);

  // 3. LaTeX blocks
  sanitized = closeLaTeX(sanitized);

  // 4. Incomplete Markdown fences
  sanitized = closeIncompleteCodeBlocks(sanitized);

  // 5. Unmatched brackets (ignoring closed code blocks)
  sanitized = closeUnmatchedBrackets(sanitized);

  return sanitized;
}
