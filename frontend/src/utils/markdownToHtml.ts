// Lightweight Markdown -> HTML converter for editor paste and AI insertion.
// TipTap parses HTML/JSON content, not raw markdown strings.
export const DOCUMENT_PATTERNS = [
  /^#{1,6}\s/m,
  /^\s*[-*+]\s/m,
  /^\s*\d+\.\s/m,
  /^\|.+\|/m,
  /^\s*>/m,
  /^\s*- \[[ x]\]/m,
  /^---+$/m,
];

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const inlineFormat = (text: string): string =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

const parseTableRow = (row: string): string[] =>
  row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

export const markdownToHtml = (md: string): string => {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^---+$/.test(line.trim())) {
      out.push("<hr>");
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    if (
      i + 1 < lines.length &&
      line.includes("|") &&
      /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(lines[i + 1].trim())
    ) {
      const tableHtml: string[] = ["<table>"];
      const headers = parseTableRow(line);
      tableHtml.push("<tr>");
      headers.forEach((header) => tableHtml.push(`<th>${inlineFormat(header)}</th>`));
      tableHtml.push("</tr>");
      i += 2;

      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        const cells = parseTableRow(lines[i]);
        tableHtml.push("<tr>");
        cells.forEach((cell) => tableHtml.push(`<td>${inlineFormat(cell)}</td>`));
        tableHtml.push("</tr>");
        i++;
      }

      tableHtml.push("</table>");
      out.push(tableHtml.join(""));
      continue;
    }

    if (line.includes("\t")) {
      const tabsCount = line.split("\t").length - 1;
      if (tabsCount > 0) {
        let isTabTable = false;
        let j = i + 1;
        while (j < lines.length && lines[j].includes("\t") && lines[j].split("\t").length - 1 === tabsCount) {
          isTabTable = true;
          j++;
        }

        if (isTabTable) {
          const tableHtml: string[] = ["<table>"];
          const headers = lines[i].split("\t").map((cell) => cell.trim());
          tableHtml.push("<tr>");
          headers.forEach((header) => tableHtml.push(`<th>${inlineFormat(header)}</th>`));
          tableHtml.push("</tr>");
          i++;

          while (i < j) {
            const cells = lines[i].split("\t").map((cell) => cell.trim());
            tableHtml.push("<tr>");
            cells.forEach((cell) => tableHtml.push(`<td>${inlineFormat(cell)}</td>`));
            tableHtml.push("</tr>");
            i++;
          }

          tableHtml.push("</table>");
          out.push(tableHtml.join(""));
          continue;
        }
      }
    }

    if (/^\s*>\s?/.test(line)) {
      const content = line.replace(/^\s*>\s?/, "");
      out.push(`<blockquote><p>${inlineFormat(content)}</p></blockquote>`);
      i++;
      continue;
    }

    if (/^\s*[-*+]\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        const taskMatch = lines[i].match(/^\s*[-*+]\s+\[([ x])\]\s+(.*)/);
        if (taskMatch) {
          const checked = taskMatch[1] === "x" ? ' data-checked="true"' : "";
          listItems.push(`<li data-type="taskItem"${checked}><p>${inlineFormat(taskMatch[2])}</p></li>`);
        } else {
          listItems.push(`<li><p>${inlineFormat(lines[i].replace(/^\s*[-*+]\s+/, ""))}</p></li>`);
        }
        i++;
      }
      out.push(`<ul>${listItems.join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        listItems.push(`<li><p>${inlineFormat(lines[i].replace(/^\s*\d+\.\s+/, ""))}</p></li>`);
        i++;
      }
      out.push(`<ol>${listItems.join("")}</ol>`);
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    out.push(`<p>${inlineFormat(line)}</p>`);
    i++;
  }

  return out.join("");
};
