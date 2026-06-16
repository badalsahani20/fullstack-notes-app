import MarkdownCodeBlock from "@/components/chat/MarkdownCodeBlock";
import MarkdownWritingBlock from "@/components/chat/MarkdownWritingBlock";

export const sharedMarkdownComponents = {
  code({ className, children, ...props }: any) {
    const rawCode = String(children ?? "").replace(/\n$/, "");
    const language = className?.replace("language-", "") || "";
    const isBlock = Boolean(language) || rawCode.includes("\n");

    if (!isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    if (language === "writing") {
      return <MarkdownWritingBlock content={rawCode} />;
    }

    return <MarkdownCodeBlock code={rawCode} language={language} />;
  },
  a({ node, ...props }: any) {
    return (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="iris-link"
      />
    );
  },
  table({ children, ...props }: any) {
    return (
      <div className="tableWrapper">
        <table {...props}>{children}</table>
      </div>
    );
  },
};
