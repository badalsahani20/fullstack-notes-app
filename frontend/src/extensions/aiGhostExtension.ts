import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiGhostText: {
      setAiGhost: () => ReturnType;
      unsetAiGhost: () => ReturnType;
    }
  }
}

export const AiGhostExtension = Mark.create({
  name: 'aiGhostText',

  parseHTML() {
    return [
      {
        tag: 'span[data-ai-ghost]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-ai-ghost': '' }), 0];
  },

  addCommands() {
    return {
      setAiGhost: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      unsetAiGhost: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});
