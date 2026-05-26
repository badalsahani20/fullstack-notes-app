import { DOCUMENT_PATTERNS, markdownToHtml } from "./markdownToHtml";

export const formatMarkDownNodes = (editor: any) : boolean => {
    let hasChanges = false;
    const doc = editor.state.doc;

    interface ParagraphRange {
        from: number;
        to: number;
        texts: string[];
    }

    const ranges: ParagraphRange[] = [];
    let currentRange: ParagraphRange | null = null;

    doc.forEach((node: any, offset: number) => {
        const startPos = offset;
        const endPos = offset + node.nodeSize;

        // Check if this paragraph contains any inline/nested image node
        let hasImage = false;
        if (node.type.name === "paragraph") {
            node.descendants((child: any) => {
                if (child.type.name === "image") {
                    hasImage = true;
                }
            });
        }

        // ONLY target paragraph nodes at the top level to prevent destroying existing formatted lists, headings, tables or blockquotes!
        // Skip paragraphs that contain images to prevent losing them during raw text format conversion.
        if (node.type.name === "paragraph" && !hasImage) {
            if(!currentRange) {
                currentRange = {
                    from: startPos,
                    to: endPos,
                    texts: [node.textContent]
                }
            } else {
                currentRange.to = endPos;
                currentRange.texts.push(node.textContent);
            }
        } else {
            if(currentRange) {
                ranges.push(currentRange);
                currentRange = null;
            }
        }
    });

    if(currentRange) {
        ranges.push(currentRange);
        currentRange = null;
    }

    for(let i=ranges.length-1; i>=0; i--) {
        const range = ranges[i];
        const rawText = range.texts.join("\n");

        // Check if this paragraph text contains any block or inline markdown, including raw triple backtick code blocks
        const hasMarkdown = DOCUMENT_PATTERNS.some((p) => p.test(rawText)) || 
            /```/.test(rawText) ||
            /\*\*([^*]+)\*\*/.test(rawText) ||
            /\*([^*]+)\*/.test(rawText) ||
            /`([^`]+)`/.test(rawText);

        if(hasMarkdown) {
            const html = markdownToHtml(rawText);

            // Completely delete the original raw paragraphs first, then insert formatted block content.
            // This prevents ProseMirror from trying to merge or preserve old paragraph boundaries.
            editor.chain()
                .focus()
                .deleteRange({ from: range.from, to: range.to })
                .insertContentAt(range.from, html)
                .run();
            
            hasChanges = true;
        }
    }

    return hasChanges;
}