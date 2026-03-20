import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "s",
  "strike",
  "u",
  "blockquote",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a",
  "img",
  "mark",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title"],
  th: ["colspan", "rowspan", "colwidth"],
  td: ["colspan", "rowspan", "colwidth"],
  mark: ["data-color"],
};

const sanitizeTableSpan = (value) => {
  const numberValue = Number.parseInt(String(value), 10);
  return Number.isInteger(numberValue) && numberValue > 0 && numberValue <= 12
    ? String(numberValue)
    : undefined;
};

export const sanitizeNoteHtml = (html = "") => {
  if (typeof html !== "string" || html.trim() === "") return "";

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    disallowedTagsMode: "discard",
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a: (tagName, attribs) => {
        const nextAttribs = { ...attribs };

        if (nextAttribs.target === "_blank") {
          nextAttribs.rel = "noopener noreferrer nofollow";
        } else {
          delete nextAttribs.target;
          delete nextAttribs.rel;
        }

        return { tagName, attribs: nextAttribs };
      },
      th: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.colspan ? { colspan: sanitizeTableSpan(attribs.colspan) } : {}),
          ...(attribs.rowspan ? { rowspan: sanitizeTableSpan(attribs.rowspan) } : {}),
          ...(attribs.colwidth && /^[\d,\s]+$/.test(attribs.colwidth) ? { colwidth: attribs.colwidth } : {}),
        },
      }),
      td: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.colspan ? { colspan: sanitizeTableSpan(attribs.colspan) } : {}),
          ...(attribs.rowspan ? { rowspan: sanitizeTableSpan(attribs.rowspan) } : {}),
          ...(attribs.colwidth && /^[\d,\s]+$/.test(attribs.colwidth) ? { colwidth: attribs.colwidth } : {}),
        },
      }),
      mark: (tagName, attribs) => ({
        tagName,
        attribs: /^#[0-9a-fA-F]{6}$/.test(attribs["data-color"] || "")
          ? { "data-color": attribs["data-color"] }
          : {},
      }),
    },
    exclusiveFilter: ({ tag, attribs }) => {
      if (tag === "img") {
        return !attribs.src;
      }
      return false;
    },
  });
};
