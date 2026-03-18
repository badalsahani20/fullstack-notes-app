/**
 * Shared types used across the AI panel components.
 * Keeping them in one place means if a type ever changes,
 * we update it here and all components stay in sync.
 */

export type AiAction = "grammar" | "summarize" | "explain" | "rewrite";

export type AssistResult = {
  action: AiAction;
  suggestion: string;
  errors: Array<{ start: number; end: number; original: string; suggestion: string | null }>;
  sourceType: "selection" | "note";
};

export type SelectionRange = { from: number; to: number } | null;

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type ChatHistoryMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
